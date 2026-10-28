#!/usr/bin/env python3
"""Testes automatizados para docs_tool.py.

Interfaces públicas testadas: new, status, board, validate.
Todos os testes usam diretórios temporários isolados; nenhum card real é modificado.
"""
import argparse
import contextlib
import datetime
import importlib.util
import io
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import unittest.mock as mock


SCRIPT = pathlib.Path(__file__).resolve().parent.parent / 'scripts' / 'docs_tool.py'
STANDARD = pathlib.Path(__file__).resolve().parents[4] / 'docs' / 'docs' / 'PADRONIZATION.md'
PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[4]
SOURCE_CARD = PROJECT_ROOT / 'docs' / 'docs' / 'active' / 'features' / '[in-progress]-workspace-multiagente-maestri' / 'README.md'

# Carrega o módulo
spec = importlib.util.spec_from_file_location('docs_tool', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TestDocsTool(unittest.TestCase):
    def setUp(self):
        self.temp_dir = pathlib.Path(tempfile.mkdtemp(prefix='maestri-test-'))
        self.docs = self.temp_dir / 'docs'
        (self.docs / 'active' / 'features').mkdir(parents=True)
        (self.docs / 'archive' / 'features').mkdir(parents=True)
        self.standard = module.Standard(STANDARD)

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _new_args(self, **overrides):
        base = dict(categoria='features', tags='docs', prioridade='baixa', resumo='Teste automatizado', slug=None, titulo='Teste automatizado')
        base.update(overrides)
        return argparse.Namespace(**base)

    def _status_args(self, card='workspace-multiagente-maestri', novo_status='ready-for-review', reason=None):
        return argparse.Namespace(card=card, novo_status=novo_status, reason=reason)

    @contextlib.contextmanager
    def _expected_output(self):
        """Captura a saída esperada de um comando que deve falhar.

        Serve apenas para deixar a execução legível: o bloco que dispara o
        erro esperado não imprime em stdout/stderr. As asserções de exceção
        e código de saída continuam valendo, e qualquer saída inesperada
        fora do bloco permanece visível.
        """
        captured = io.StringIO()
        with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
            yield captured

    # ==================== new ====================

    def test_new_creates_card_with_readme_and_log(self):
        module.cmd_new(self._new_args(), self.standard, self.docs)
        card = self.docs / 'active' / 'features' / '[draft]-teste-automatizado'
        self.assertTrue(card.is_dir())
        self.assertTrue((card / 'README.md').is_file())
        self.assertTrue((card / 'LOG.md').is_file())
        readme = (card / 'README.md').read_text(encoding='utf-8')
        self.assertIn('**Status:** `draft`', readme)
        self.assertIn('**Prioridade:** `baixa`', readme)
        self.assertIn('**Tags:** `docs`', readme)
        self.assertIn('**Resumo:** Teste automatizado', readme)
        log = (card / 'LOG.md').read_text(encoding='utf-8')
        self.assertIn('card criado', log)

    def test_new_rejects_duplicate_slug(self):
        with self._expected_output():
            module.cmd_new(self._new_args(), self.standard, self.docs)
        with self._expected_output(), self.assertRaises(SystemExit) as cm:
            module.cmd_new(self._new_args(), self.standard, self.docs)
        self.assertEqual(cm.exception.code, 2)

    def test_new_rejects_invalid_tags(self):
        with self._expected_output(), self.assertRaises(SystemExit):
            module.cmd_new(self._new_args(tags='tag_inexistente'), self.standard, self.docs)

    def test_new_rejects_invalid_priority(self):
        with self._expected_output(), self.assertRaises(SystemExit):
            module.cmd_new(self._new_args(prioridade='urgente'), self.standard, self.docs)

    def test_new_rejects_multiline_resumo(self):
        with self._expected_output(), self.assertRaises(SystemExit):
            module.cmd_new(self._new_args(resumo='linha 1\nlinha 2'), self.standard, self.docs)

    def test_new_fault_readme_leaves_no_staging(self):
        original_write = pathlib.Path.write_text
        def fail_readme(self, *a, **kw):
            if self.name == 'README.md':
                raise OSError('readme fault')
            return original_write(self, *a, **kw)
        with mock.patch.object(pathlib.Path, 'write_text', fail_readme):
            with self.assertRaises(OSError):
                module.cmd_new(self._new_args(titulo='Falha README', slug='falha-readme'), self.standard, self.docs)
        staging = list((self.docs / 'active' / 'features').glob('.falha-readme-*'))
        self.assertEqual(len(staging), 0)
        card = self.docs / 'active' / 'features' / '[draft]-falha-readme'
        self.assertFalse(card.exists())

    def test_new_fault_log_leaves_no_staging(self):
        with mock.patch.object(module, 'append_log', side_effect=OSError('log fault')):
            with self.assertRaises(OSError):
                module.cmd_new(self._new_args(titulo='Falha LOG', slug='falha-log'), self.standard, self.docs)
        staging = list((self.docs / 'active' / 'features').glob('.falha-log-*'))
        self.assertEqual(len(staging), 0)
        card = self.docs / 'active' / 'features' / '[draft]-falha-log'
        self.assertFalse(card.exists())

    def test_new_fault_rename_leaves_no_staging(self):
        with mock.patch.object(pathlib.Path, 'rename', side_effect=OSError('rename fault')):
            with self.assertRaises(OSError):
                module.cmd_new(self._new_args(titulo='Falha Rename', slug='falha-rename'), self.standard, self.docs)
        staging = list((self.docs / 'active' / 'features').glob('.falha-rename-*'))
        self.assertEqual(len(staging), 0)
        card = self.docs / 'active' / 'features' / '[draft]-falha-rename'
        self.assertFalse(card.exists())

    # ==================== status ====================

    def _seed_card(self, slug='workspace-multiagente-maestri', status='draft', **overrides):
        card = self.docs / 'active' / 'features' / f'[{status}]-{slug}'
        card.mkdir(parents=True)
        text = SOURCE_CARD.read_text(encoding='utf-8')
        text = text.replace('**Status:** `in-progress`', f'**Status:** `{status}`', 1)
        (card / 'README.md').write_text(text, encoding='utf-8')
        (card / 'LOG.md').write_text('# Registro\n\n## Registro\n', encoding='utf-8')
        return card

    def test_status_valid_draft_to_ready_for_review(self):
        self._seed_card(status='draft')
        module.cmd_status(self._status_args(), self.standard, self.docs)
        dest = self.docs / 'active' / 'features' / '[ready-for-review]-workspace-multiagente-maestri'
        self.assertTrue(dest.is_dir())
        self.assertFalse((self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri').exists())
        content = (dest / 'README.md').read_text(encoding='utf-8')
        self.assertIn('**Status:** `ready-for-review`', content)
        self.assertNotIn('**Status:** `draft`', content)
        log = (dest / 'LOG.md').read_text(encoding='utf-8')
        self.assertIn('status: draft -> ready-for-review', log)

    def test_status_rejects_invalid_transition_draft_to_approved(self):
        self._seed_card(status='draft')
        with self._expected_output(), self.assertRaises(SystemExit) as cm:
            module.cmd_status(self._status_args(novo_status='approved'), self.standard, self.docs)
        self.assertEqual(cm.exception.code, 2)

    def test_status_rejects_cancelled_without_reason(self):
        self._seed_card(status='draft')
        with self._expected_output(), self.assertRaises(SystemExit) as cm:
            module.cmd_status(self._status_args(novo_status='cancelled', reason=''), self.standard, self.docs)
        self.assertEqual(cm.exception.code, 2)

    def test_status_rejects_cancelled_by_tool(self):
        self._seed_card(status='draft')
        with self._expected_output(), self.assertRaises(SystemExit) as cm:
            module.cmd_status(self._status_args(novo_status='cancelled', reason='motivo'), self.standard, self.docs)
        self.assertEqual(cm.exception.code, 2)

    def test_status_rejects_ready_for_review_with_template_sections(self):
        card = self.docs / 'active' / 'features' / '[draft]-prova-isolada'
        card.mkdir(parents=True)
        # Usar o template bruto da feature com placeholders
        template = self.standard.templates['features']
        text = re.sub(r"^# .*$", lambda m: "# ✨ Prova Isolada", template, count=1, flags=re.M)
        text = re.sub(r"^\*\*Data:\*\* .*$", lambda m: f"**Data:** {datetime.date.today().isoformat()}", text, flags=re.M)
        text = re.sub(r"^\*\*Prioridade:\*\* .*$", lambda m: "**Prioridade:** `baixa`", text, flags=re.M)
        text = re.sub(r"^\*\*Tags:\*\* .*$", lambda m: "**Tags:** `docs`", text, flags=re.M)
        text = re.sub(r"^\*\*Resumo:\*\* .*$", lambda m: "**Resumo:** Teste isolado", text, flags=re.M)
        (card / 'README.md').write_text(text, encoding='utf-8')
        (card / 'LOG.md').write_text('# Registro\n\n## Registro\n', encoding='utf-8')
        with self._expected_output(), self.assertRaises(SystemExit) as cm:
            module.cmd_status(self._status_args(card='prova-isolada', novo_status='ready-for-review'), self.standard, self.docs)
        self.assertEqual(cm.exception.code, 2)

    def test_status_fault_rename_restores_original(self):
        self._seed_card(status='draft')
        call_count = {'count': 0}
        original_move = module.shutil.move
        def fail_on_second_call(*args, **kwargs):
            call_count['count'] += 1
            if call_count['count'] == 2:
                raise OSError('falha adicional no rollback')
            return original_move(*args, **kwargs)
        with mock.patch.object(module.shutil, 'move', side_effect=fail_on_second_call):
            with mock.patch.object(module, 'replace_text', side_effect=OSError('replace fault')):
                with self.assertRaises(RuntimeError) as cm:
                    module.cmd_status(self._status_args(), self.standard, self.docs)
        self.assertIn('estado inconsistente', str(cm.exception))
        dest = self.docs / 'active' / 'features' / '[ready-for-review]-workspace-multiagente-maestri'
        self.assertTrue(dest.exists())
        self.assertTrue((dest / '.RECOVERY_REQUIRED').exists())
        self.assertEqual((dest / 'README.md').read_text(encoding='utf-8'), SOURCE_CARD.read_text(encoding='utf-8').replace('**Status:** `in-progress`', '**Status:** `draft`', 1))
        self.assertEqual((dest / 'LOG.md').read_text(encoding='utf-8'), '# Registro\n\n## Registro\n')

    def test_status_fault_readme_replace_restores_original(self):
        self._seed_card(status='draft')
        with mock.patch.object(module.os, 'replace', side_effect=OSError('replace fault')):
            with self.assertRaises(OSError):
                module.cmd_status(self._status_args(), self.standard, self.docs)
        card = self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri'
        dest = self.docs / 'active' / 'features' / '[ready-for-review]-workspace-multiagente-maestri'
        self.assertTrue(card.is_dir())
        self.assertFalse(dest.exists())
        self.assertEqual((card / 'README.md').read_text(encoding='utf-8'), SOURCE_CARD.read_text(encoding='utf-8').replace('**Status:** `in-progress`', '**Status:** `draft`', 1))

    def test_status_fault_log_write_restores_original(self):
        self._seed_card(status='draft')
        with mock.patch.object(module, 'append_log', side_effect=OSError('log fault')):
            with self.assertRaises(OSError):
                module.cmd_status(self._status_args(), self.standard, self.docs)
        card = self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri'
        self.assertTrue(card.is_dir())
        self.assertEqual((card / 'LOG.md').read_text(encoding='utf-8'), '# Registro\n\n## Registro\n')

    def test_status_fault_partial_log_preserves_previous_entries(self):
        self._seed_card(status='draft')
        prior = SOURCE_CARD.read_text(encoding='utf-8').replace('**Status:** `in-progress`', '**Status:** `draft`', 1)
        def partial(directory, title, body):
            with (directory / 'LOG.md').open('a', encoding='utf-8') as stream:
                stream.write('\n### novo incompleto')
            raise OSError('disco cheio após escrita parcial')
        with mock.patch.object(module, 'append_log', side_effect=partial):
            with self.assertRaises(OSError):
                module.cmd_status(self._status_args(), self.standard, self.docs)
        card = self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri'
        self.assertTrue(card.is_dir())
        log = (card / 'LOG.md').read_text(encoding='utf-8')
        self.assertEqual(log, '# Registro\n\n## Registro\n')

    def test_status_fault_partial_log_with_preexisting_log_preserves_it(self):
        self._seed_card(status='draft')
        prior_log = '# Registro\n\n## Registro\n### anterior\n- Evidência anterior\n'
        (self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri' / 'LOG.md').write_text(prior_log, encoding='utf-8')
        def partial(directory, title, body):
            with (directory / 'LOG.md').open('a', encoding='utf-8') as stream:
                stream.write('\n### novo incompleto')
            raise OSError('disco cheio após escrita parcial')
        with mock.patch.object(module, 'append_log', side_effect=partial):
            with self.assertRaises(OSError):
                module.cmd_status(self._status_args(), self.standard, self.docs)
        card = self.docs / 'active' / 'features' / '[draft]-workspace-multiagente-maestri'
        self.assertTrue(card.is_dir())
        log = (card / 'LOG.md').read_text(encoding='utf-8')
        self.assertEqual(log, prior_log)

    # ==================== board ====================

    def test_board_lists_cards(self):
        self._seed_card(status='draft')
        module.cmd_new(self._new_args(titulo='Outro card', slug='outro-card'), self.standard, self.docs)
        import io
        captured = io.StringIO()
        sys_stdout = sys.stdout
        sys.stdout = captured
        try:
            module.cmd_board(argparse.Namespace(), self.standard, self.docs)
        finally:
            sys.stdout = sys_stdout
        output = captured.getvalue()
        self.assertIn('[draft]', output)
        self.assertIn('workspace-multiagente-maestri', output)
        self.assertIn('outro-card', output)

    # ==================== validate ====================

    def test_validate_clean_card(self):
        self._seed_card(status='draft')
        result = module.cmd_validate(argparse.Namespace(), self.standard, self.docs)
        self.assertEqual(result, 0)

    def test_validate_reports_errors_for_broken_card(self):
        # Card sem README
        card = self.docs / 'active' / 'features' / '[draft]-quebrado'
        card.mkdir(parents=True)
        # sem README.md, sem LOG.md
        with self._expected_output():
            result = module.cmd_validate(argparse.Namespace(), self.standard, self.docs)
        self.assertNotEqual(result, 0)

    # ==================== CLI integration ====================

    def test_cli_new_returns_zero_on_success(self):
        result = subprocess.run(
            [sys.executable, '-I', str(SCRIPT), '--docs', str(self.docs), '--standard', str(STANDARD),
             'new', 'features', 'CLI Teste', '--prioridade', 'baixa', '--tags', 'docs', '--resumo', 'CLI teste'],
            capture_output=True, text=True, encoding='utf-8', errors='replace'
        )
        self.assertEqual(result.returncode, 0)

    def test_cli_status_returns_zero_on_valid_transition(self):
        self._seed_card(status='draft')
        result = subprocess.run(
            [sys.executable, '-I', str(SCRIPT), '--docs', str(self.docs), '--standard', str(STANDARD),
             'status', 'workspace-multiagente-maestri', 'ready-for-review'],
            capture_output=True, text=True, encoding='utf-8', errors='replace'
        )
        self.assertEqual(result.returncode, 0)

    def test_cli_board_returns_zero(self):
        result = subprocess.run(
            [sys.executable, '-I', str(SCRIPT), '--docs', str(self.docs), '--standard', str(STANDARD), 'board'],
            capture_output=True, text=True, encoding='utf-8', errors='replace'
        )
        self.assertEqual(result.returncode, 0)

    def test_cli_validate_returns_zero_on_clean(self):
        self._seed_card(status='draft')
        result = subprocess.run(
            [sys.executable, '-I', str(SCRIPT), '--docs', str(self.docs), '--standard', str(STANDARD), 'validate'],
            capture_output=True, text=True, encoding='utf-8', errors='replace'
        )
        self.assertEqual(result.returncode, 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)