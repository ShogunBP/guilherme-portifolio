#!/usr/bin/env python3
"""docs_tool.py - ferramenta documental do portfólio.

Somente biblioteca padrão (Python 3.8+). Tags, status e templates são lidos de
docs/docs/PADRONIZATION.md; os cards ficam em docs/docs/.

Uso (a partir da raiz do repositorio):
  python .agents/skills/docs-standard/scripts/docs_tool.py new <categoria> "<Titulo>" \
      --prioridade alta --tags frontend,dx --resumo "Uma linha objetiva"
  python .agents/skills/docs-standard/scripts/docs_tool.py status <card> <novo-status>
  python .agents/skills/docs-standard/scripts/docs_tool.py log <card> --acao ... --resultado ... --conclusao refutado
  python .agents/skills/docs-standard/scripts/docs_tool.py validate
  python .agents/skills/docs-standard/scripts/docs_tool.py board
"""
import argparse
import datetime
import os
import re
import shutil
import sys
import tempfile
import unicodedata
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):  # consoles Windows (cp1252) quebram com emoji
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CATEGORIES = {"bugs": "🐛", "features": "✨", "enhancements": "🔧", "refactoring": "♻"}
PRIORITIES = ("alta", "média", "baixa")
CARD_RE = re.compile(r"^\[([a-z-]+)\]-([a-z0-9]+(?:-[a-z0-9]+)*)$")
FIELD_RE = re.compile(r"^\*\*(Status|Data|Prioridade|Tags|Resumo):\*\* ?(.*)$", re.M)
BOX_RE = re.compile(r"^\s*- \[( |x|X)\]", re.M)
PLACEHOLDER_RE = re.compile(r"^>?\s*_\(.*\)_$", re.S)

# Transicoes do fluxo do padrao. Quem pode fazer cada uma esta em HUMAN_ONLY.
TRANSITIONS = {
    "draft": {"ready-for-review"},
    "ready-for-review": {"approved", "changes-requested"},
    "changes-requested": {"ready-for-review"},
    "approved": {"in-progress"},
    "in-progress": {"done"},
}
HUMAN_ONLY = {"approved", "changes-requested", "done", "cancelled"}
# Secoes que o autor preenche (as demais - Review/Feedback/Decisao/Validacao - sao do fluxo).
FLOW_SECTIONS = {"Review", "Feedback", "Decisão", "Validação"}


class Standard:
    def __init__(self, readme: Path):
        if not readme.is_file():
            die(f"{readme} não encontrado: ele é a fonte de verdade do padrão.")
        text = readme.read_text(encoding="utf-8")

        m = re.search(r"### Lista de Tags Predefinidas(.*?)(?=\n#{2,3} |\Z)", text, re.S)
        self.tags = re.findall(r"^\| `([^`]+)` \|", m.group(1), re.M) if m else []

        m = re.search(r"## Status Possíveis(.*?)(?=\n## |\Z)", text, re.S)
        rows = re.findall(r"^\| `\[([a-z-]+)\]` \|.*\| `(active|archive)/` \|\s*$",
                          m.group(1), re.M) if m else []
        self.location = dict(rows)

        self.templates = {}
        m = re.search(r"## Template por Categoria(.*)", text, re.S)
        for block in re.findall(r"```markdown\n(.*?)\n```", m.group(1), re.S) if m else []:
            for cat, emoji in CATEGORIES.items():
                if block.startswith("# " + emoji):
                    self.templates[cat] = block

        if not self.tags or not self.location or len(self.templates) != len(CATEGORIES):
            die(f"Não consegui ler tags/status/templates de {readme}. "
                "O formato do padrão mudou? Ajuste docs_tool.py (parse) em vez de contornar.")

    def template_sections(self, cat):
        return sections(self.templates[cat])


def die(msg, code=2):
    print(f"ERRO: {msg}", file=sys.stderr)
    sys.exit(code)


def slugify(title):
    s = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def sections(text):
    """{nome da secao '##': corpo}. Tudo antes do primeiro '##' fica em ''."""
    parts = re.split(r"^## (.+?)\s*$", text, flags=re.M)
    out = {"": parts[0]}
    for i in range(1, len(parts), 2):
        out[parts[i].strip()] = parts[i + 1]
    return out


def fields(text):
    return {k: v.strip() for k, v in FIELD_RE.findall(text)}


def unbacktick(v):
    return v.strip().strip("`").strip()


def is_placeholder(body):
    b = body.strip().strip("-").strip()
    return bool(b) and bool(PLACEHOLDER_RE.match(b))


def boxes(body):
    marks = BOX_RE.findall(body)
    return sum(1 for m in marks if m.lower() == "x"), len(marks)


def progress(text):
    sec = sections(text)
    done = total = 0
    for name in ("Critérios de Conclusão", "Validação"):
        d, t = boxes(sec.get(name, ""))
        done, total = done + d, total + t
    return done, total


def split_name(name):
    m = CARD_RE.match(name)
    return (m.group(1), m.group(2)) if m else (None, None)


def all_cards(docs):
    for area in ("active", "archive"):
        for cat in CATEGORIES:
            base = docs / area / cat
            if base.is_dir():
                for p in sorted(base.iterdir()):
                    if p.is_dir():
                        yield area, cat, p


def find_card(docs, ref):
    wanted = re.sub(r"^\[[a-z-]+\]-", "", Path(ref).name.rstrip("/\\"))
    hits = [(a, c, p) for a, c, p in all_cards(docs) if re.sub(r"^\[[a-z-]+\]-", "", p.name) == wanted]
    if not hits:
        die(f"card '{ref}' nao encontrado em {docs}/active ou {docs}/archive.")
    if len(hits) > 1:
        die("card ambiguo: " + ", ".join(str(h[2]) for h in hits))
    return hits[0]


def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M")


def append_log(card_dir, title, body):
    log = card_dir / "LOG.md"
    if not log.exists():
        log.write_text(LOG_HEADER, encoding="utf-8")
    with log.open("a", encoding="utf-8") as f:
        f.write(f"\n### {now()} - {title}\n{body.rstrip()}\n")


def replace_text(path, text):
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n",
                                     dir=path.parent, prefix=".readme-", suffix=".tmp",
                                     delete=False) as output:
        temporary = Path(output.name)
    try:
        temporary.write_text(text, encoding="utf-8")
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


LOG_HEADER = """# Registro de execução

> Só acrescentar. Nunca apagar nem reescrever entradas anteriores.
> Tentativa refutada = entrada com **Conclusão: refutado**, com ação e resultado reais.
> Resultado real = saída/observação de verdade (cole trechos), nunca resumo de memória.

## Registro
"""


# ----------------------------------------------------------------------------- new
def cmd_new(a, std, docs):
    if a.categoria not in CATEGORIES:
        die(f"categoria deve ser uma de {', '.join(CATEGORIES)}.")
    tags = [t.strip() for t in a.tags.split(",") if t.strip()]
    bad = [t for t in tags if t not in std.tags]
    if not tags or bad:
        die(f"tags invalidas {bad or ''}. Permitidas: {', '.join(std.tags)}")
    if a.prioridade not in PRIORITIES:
        die(f"prioridade deve ser uma de {', '.join(PRIORITIES)}.")
    resumo = a.resumo.strip()
    if not resumo or "\n" in resumo:
        die("resumo deve ser uma unica linha nao vazia.")
    slug = a.slug or slugify(a.titulo)
    if not CARD_RE.match(f"[draft]-{slug}"):
        die(f"slug '{slug}' invalido (kebab-case ascii).")
    if any(re.sub(r"^\[[a-z-]+\]-", "", p.name) == slug for _, _, p in all_cards(docs)):
        die(f"ja existe um card com o slug '{slug}'.")

    text = std.templates[a.categoria]
    emoji = CATEGORIES[a.categoria]
    text = re.sub(r"^# .*$", lambda m: f"# {emoji} {a.titulo.strip()}", text, count=1, flags=re.M)
    text = re.sub(r"^\*\*Data:\*\* .*$", lambda m: f"**Data:** {datetime.date.today().isoformat()}", text, flags=re.M)
    text = re.sub(r"^\*\*Prioridade:\*\* .*$", lambda m: f"**Prioridade:** `{a.prioridade}`", text, flags=re.M)
    text = re.sub(r"^\*\*Tags:\*\* .*$", lambda m: "**Tags:** " + ", ".join(f"`{t}`" for t in tags), text, flags=re.M)
    text = re.sub(r"^\*\*Resumo:\*\* .*$", lambda m: f"**Resumo:** {resumo}", text, flags=re.M)

    card = docs / "active" / a.categoria / f"[draft]-{slug}"
    card.parent.mkdir(parents=True, exist_ok=True)
    if card.exists():
        die(f"destino já existe: {card}")
    staging = Path(tempfile.mkdtemp(prefix=f".{slug}-", dir=card.parent))
    try:
        (staging / "README.md").write_text(text + "\n", encoding="utf-8")
        append_log(staging, "card criado", "- **Ação:** card criado a partir do template do padrão (draft)\n"
                                         "- **Conclusão:** ok")
        if card.exists():
            die(f"destino já existe: {card}")
        staging.rename(card)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    print(f"criado: {card}/README.md  (preencha as secoes; o corpo ainda e o texto do template)")


# -------------------------------------------------------------------------- status
def unfilled(card_text, std, cat):
    """Lista o que ainda e texto de template (autor nao preencheu)."""
    out = []
    tpl_text = std.templates[cat]
    f, tf = fields(card_text), fields(tpl_text)
    if re.search(r"^# .*\[Título", card_text, re.M):
        out.append("titulo ainda e '[Título ...]'")
    if f.get("Data", "") == "YYYY-MM-DD":
        out.append("Data = YYYY-MM-DD")
    if f.get("Resumo", "") == tf.get("Resumo", ""):
        out.append("Resumo ainda e o texto do template")
    sec, tsec = sections(card_text), sections(tpl_text)
    for name, body in tsec.items():
        if name and name not in FLOW_SECTIONS and sec.get(name, "").strip() == body.strip():
            out.append(f"secao '{name}' ainda e o texto do template")
    return out


def cmd_status(a, std, docs):
    area, cat, card = find_card(docs, a.card)
    cur, slug = split_name(card.name)
    new = a.novo_status
    if cur is None or cur not in std.location:
        die(f"nome de pasta fora do padrao: {card.name}")
    if new not in std.location:
        die(f"status invalido. Validos: {', '.join(std.location)}")
    allowed = set(TRANSITIONS.get(cur, set()))
    if cur in TRANSITIONS or cur == "changes-requested":
        allowed.add("cancelled")
    if new not in allowed:
        die(f"transicao {cur} -> {new} nao existe no fluxo. Permitidas a partir de {cur}: "
            f"{', '.join(sorted(allowed)) or 'nenhuma (estado final)'}")
    if new in HUMAN_ONLY:
        die(f"'{new}' é decisão humana; esta ferramenta não autentica identidade. "
            "O humano registra a decisão no card e autoriza a mudança pelo fluxo documental.")

    readme = card / "README.md"
    if not readme.is_file():
        die(f"README.md ausente: {readme}")
    text = readme.read_text(encoding="utf-8")
    sec = sections(text)
    problems = []
    if new == "ready-for-review":
        problems += unfilled(text, std, cat)
    if new == "in-progress" and not re.search(r"^\s*- \[[xX]\] Aprovado", sec.get("Decisão", ""), re.M):
        problems.append("aprovação humana ausente: marque '- [x] Aprovado' na seção Decisão antes")
    if new == "changes-requested":
        if not re.search(r"^\s*- \[[xX]\] Alterações solicitadas", sec.get("Decisão", ""), re.M):
            problems.append("marque '- [x] Alterações solicitadas' na secao Decisão antes")
        if is_placeholder(sec.get("Feedback", "")):
            problems.append("preencha a secao Feedback antes")
    if new == "done":
        d, t = progress(text)
        if d < t:
            problems.append(f"checkboxes de Critérios/Validação incompletos ({d}/{t})")
        if not (card / "LOG.md").exists():
            problems.append("LOG.md ausente")
    if new == "cancelled" and not (a.reason or "").strip():
        problems.append("--reason obrigatorio (justificativa do cancelamento)")
    if problems:
        die("nao posso mudar para '%s':\n  - %s" % (new, "\n  - ".join(problems)))

    dest_area = std.location[new]
    dest = docs / dest_area / cat / f"[{new}]-{slug}"
    if dest.exists():
        die(f"destino já existe: {dest}")
    updated = re.sub(r"^\*\*Status:\*\* .*$", lambda m: f"**Status:** `{new}`", text, count=1, flags=re.M)
    if updated == text:
        die("campo Status ausente ou já contém o status solicitado")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(card), str(dest))
    readme_replaced = False
    try:
        replace_text(dest / "README.md", updated)
        readme_replaced = True
    except OSError:
        try:
            shutil.move(str(dest), str(card))
        except OSError:
            marker = dest / ".RECOVERY_REQUIRED"
            try:
                marker.write_text(f"falha dupla: rollback da renomeação falhou; status original={cur}, alvo={new}, slug={slug}", encoding="utf-8")
            except OSError:
                pass
            raise RuntimeError(f"card {slug} em estado inconsistente: pasta movida para {new} mas rollback falhou. Corrija manualmente ou use ferramenta de diagnóstico.")
        raise
    who = "agente, após autorização explícita do humano"
    body = f"- **Ação:** status {cur} -> {new} por {who}"
    if a.reason:
        body += f"\n- **Justificativa:** {a.reason.strip()}"
    body += "\n- **Conclusão:** ok"
    log = dest / "LOG.md"
    log_size = log.stat().st_size if log.exists() else None
    try:
        append_log(dest, f"status: {cur} -> {new}", body)
    except OSError:
        if log_size is None:
            if log.exists():
                log.unlink()
        elif log.exists():
            with log.open("r+b") as previous:
                previous.truncate(log_size)
        if readme_replaced:
            try:
                replace_text(dest / "README.md", text)
            except OSError:
                pass
        try:
            shutil.move(str(dest), str(card))
        except OSError:
            marker = dest / ".RECOVERY_REQUIRED"
            try:
                marker.write_text(f"falha dupla: rollback da renomeação falhou; status original={cur}, alvo={new}, slug={slug}", encoding="utf-8")
            except OSError:
                pass
            raise RuntimeError(f"card {slug} em estado inconsistente: pasta movida para {new} mas rollback falhou. Corrija manualmente ou use ferramenta de diagnóstico.")
        raise
    print(f"{card.name} -> {dest.relative_to(docs.parent) if docs.parent in dest.parents else dest}")


# ----------------------------------------------------------------------------- log
def cmd_log(a, std, docs):
    area, cat, card = find_card(docs, a.card)
    body = (f"- **Ação:** {a.acao.strip()}\n- **Resultado real:** {a.resultado.strip()}\n"
            f"- **Conclusão:** {a.conclusao}")
    if a.proximo:
        body += f"\n- **Próximo passo:** {a.proximo.strip()}"
    append_log(card, a.titulo or "registro", body)
    print(f"registrado em {card / 'LOG.md'}")


# -------------------------------------------------------------------------- validate
def validate_card(area, cat, card, std, errs, warns):
    where = f"{area}/{cat}/{card.name}"
    status, slug = split_name(card.name)
    if status is None:
        errs.append(f"{where}: nome fora do padrao '[status]-titulo-em-kebab-case'")
        return
    if status not in std.location:
        errs.append(f"{where}: status '{status}' inexistente")
        return
    if std.location[status] != area:
        errs.append(f"{where}: status '{status}' deveria estar em {std.location[status]}/")
    readme = card / "README.md"
    if not readme.exists():
        errs.append(f"{where}: README.md ausente")
        return
    text = readme.read_text(encoding="utf-8")

    first = text.lstrip().splitlines()[0] if text.strip() else ""
    if not first.startswith("# " + CATEGORIES[cat]):
        errs.append(f"{where}: titulo deveria comecar com '# {CATEGORIES[cat]} '")

    f = fields(text)
    for k in ("Status", "Data", "Prioridade", "Tags", "Resumo"):
        if k not in f:
            errs.append(f"{where}: campo **{k}:** ausente")
    if f.get("Status") and unbacktick(f["Status"]) != status:
        errs.append(f"{where}: campo Status ('{unbacktick(f['Status'])}') diverge da pasta ('{status}')")
    if f.get("Data") and f["Data"] != "YYYY-MM-DD":
        try:
            datetime.date.fromisoformat(f["Data"])
        except ValueError:
            errs.append(f"{where}: Data '{f['Data']}' nao e YYYY-MM-DD")
    if f.get("Prioridade") and unbacktick(f["Prioridade"]) not in PRIORITIES:
        errs.append(f"{where}: Prioridade '{f['Prioridade']}' invalida (alta|média|baixa)")
    if "Tags" in f:
        tags = re.findall(r"`([^`]+)`", f["Tags"])
        if not tags:
            errs.append(f"{where}: Tags vazio")
        for t in tags:
            if t not in std.tags:
                errs.append(f"{where}: tag '{t}' fora da lista predefinida")
    if "Resumo" in f and not f["Resumo"]:
        errs.append(f"{where}: Resumo vazio")

    if re.search(r"^### (Feedback|Decisão)\b", text, re.M):
        errs.append(f"{where}: Feedback/Decisão devem ser '##', nao '###'")
    sec = sections(text)
    for name in std.template_sections(cat):
        if name and name not in sec:
            errs.append(f"{where}: secao '## {name}' ausente")

    if status not in ("draft", "cancelled"):  # cancelar um rascunho nunca preenchido e legitimo
        for p in unfilled(text, std, cat):
            errs.append(f"{where}: {p} (status {status} exige card preenchido)")
    dec = sec.get("Decisão", "")
    if status in ("approved", "in-progress", "done") and not re.search(r"^\s*- \[[xX]\] Aprovado", dec, re.M):
        errs.append(f"{where}: status '{status}' sem '- [x] Aprovado' marcado na Decisão (aprovação humana não registrada)")
    if status == "done":
        d, t = progress(text)
        if d < t:
            errs.append(f"{where}: [done] com checkboxes pendentes ({d}/{t})")
    if status in ("in-progress", "done"):
        log = card / "LOG.md"
        if not log.exists() or len(log.read_text(encoding="utf-8").strip().splitlines()) < 6:
            warns.append(f"{where}: LOG.md ausente ou sem registros alem do cabecalho")


def cmd_validate(a, std, docs):
    errs, warns = [], []
    for area in ("active", "archive"):
        if not (docs / area).is_dir():
            errs.append(f"{docs}/{area}/ ausente")
            continue
        for p in sorted((docs / area).iterdir()):
            if p.is_dir() and p.name not in CATEGORIES:
                warns.append(f"{area}/{p.name}: categoria desconhecida (esperado: {', '.join(CATEGORIES)})")
    n = 0
    for area, cat, card in all_cards(docs):
        n += 1
        validate_card(area, cat, card, std, errs, warns)
    for w in warns:
        print("AVISO:", w)
    for e in errs:
        print("ERRO: ", e)
    print(f"{n} card(s) verificados: {len(errs)} erro(s), {len(warns)} aviso(s)")
    return 1 if errs else 0


# ----------------------------------------------------------------------------- board
def cmd_board(a, std, docs):
    rows = {}
    for area, cat, card in all_cards(docs):
        status, slug = split_name(card.name)
        readme = card / "README.md"
        text = readme.read_text(encoding="utf-8") if readme.exists() else ""
        d, t = progress(text)
        f = fields(text)
        rows.setdefault(status or "?", []).append(
            (cat, slug or card.name, unbacktick(f.get("Prioridade", "?")), f"{d}/{t}", f.get("Resumo", "")))
    if not rows:
        print("(nenhum card)")
        return 0
    order = list(std.location) + ["?"]
    for st in order:
        if st in rows:
            print(f"\n## [{st}]  ({len(rows[st])})")
            for cat, slug, prio, prog, res in rows[st]:
                print(f"- {cat}/{slug}  prioridade={prio}  progresso={prog}  - {res}")
    waiting = len(rows.get("ready-for-review", []))
    if waiting:
        print(f"\n>> {waiting} card(s) aguardando revisao humana.")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    root = Path(__file__).resolve().parents[4]
    ap.add_argument("--docs", default=str(root / "docs" / "docs"),
                    help="raiz dos cards (padrão: docs/docs/ deste projeto)")
    ap.add_argument("--standard", default=str(root / "docs" / "docs" / "PADRONIZATION.md"),
                    help="arquivo do padrão, independente da raiz dos cards")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("new", help="cria card [draft] a partir do template do padrao")
    p.add_argument("categoria")
    p.add_argument("titulo")
    p.add_argument("--prioridade", required=True)
    p.add_argument("--tags", required=True, help="separadas por virgula, da lista predefinida")
    p.add_argument("--resumo", required=True, help="uma unica linha")
    p.add_argument("--slug")
    p.set_defaults(fn=cmd_new)

    p = sub.add_parser("status", help="muda o status (renomeia/move a pasta e espelha o campo)")
    p.add_argument("card", help="slug, nome da pasta ou caminho")
    p.add_argument("novo_status")
    p.add_argument("--reason", help="obrigatorio para cancelled")
    p.set_defaults(fn=cmd_status)

    p = sub.add_parser("log", help="acrescenta entrada ao LOG.md do card")
    p.add_argument("card")
    p.add_argument("--acao", required=True)
    p.add_argument("--resultado", required=True, help="resultado REAL (saida/observacao), nao resumo de memoria")
    p.add_argument("--conclusao", required=True, choices=["funcionou", "refutado", "parcial"])
    p.add_argument("--proximo")
    p.add_argument("--titulo")
    p.set_defaults(fn=cmd_log)

    sub.add_parser("validate", help="valida todos os cards contra o padrao").set_defaults(fn=cmd_validate)
    sub.add_parser("board", help="lista cards por status com progresso").set_defaults(fn=cmd_board)

    a = ap.parse_args()
    docs = Path(a.docs)
    std = Standard(Path(a.standard))
    sys.exit(a.fn(a, std, docs) or 0)


if __name__ == "__main__":
    main()
