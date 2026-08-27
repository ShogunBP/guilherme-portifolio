# Guia Resend - Como Funciona e Como Usar no Portfolio

## O que e Resend?

Resend e um **servico de envio de email via API**. Ele nao e uma caixa de entrada como Gmail ou Outlook. Ele e o "carteiro" - voce da a carta pra ele e ele entrega.

```
[Formulario do site] --> [API do Resend] --> [Caixa de entrada do destinatario]
```

** Analogia:** Resend e como um motoboy de documentos. Voce entrega o documento, ele leva ate o destinatario. O motoboy nao guarda a carta pra voce - ele so entrega.

---

## O que esta acontecendo agora

### Por que o email so aparece no painel do Resend e nao no Gmail?

Voce esta usando `onboarding@resend.dev` como remetente. Esse e o **endereco de teste** do Resend. Ele funciona assim:

```
onboarding@resend.dev  -->  So aparece no painel do Resend (nao vai pro Gmail)
seu@seudominio.com     -->  Vai pro Gmail normalmente
```

O endereco de teste existe pra voce **testar se a API funciona** sem precisar configurar um dominio. Mas ele **nao entrega emails reais** na caixa de entrada de ninguem.

### Por que o email aparece "feio" no painel do Resend?

O painel do Resend mostra o HTML **cru** (codigo-fonte). No Gmail, esse mesmo HTML seria renderizado bonito com titulo, links clicaveis, etc. O que voce ve no painel e o "esqueleto" do email, nao a versao final.

---

## Como fazer os emails chegarem no seu Gmail

### Passo 1: Registrar um dominio proprio

Voce precisa de um dominio (ex: `guilhermemenezes.com`). Se ja tem um, otimo. Se nao:
- Compre na [Namecheap](https://namecheap.com) (~$10/ano) ou [Registro.br](https://registro.br) (~R$40/ano)

### Passo 2: Adicionar o dominio no Resend

1. Va em https://resend.com/domains
2. Clique em "Add Domain"
3. Digite seu dominio (ex: `guilhermemenezes.com`)

### Passo 3: Configurar os registros DNS

O Resend vai te dar **3 registros DNS** pra adicionar no seu provedor de dominio. Eles ficam assim:

| Tipo | Nome | Valor |
|------|------|-------|
| TXT | resend._domainkey | p=MIGf... (chave longa) |
| TXT | _dmarc | v=DMARC1; p=none; |
| MX | mail | feedback... resend.dev |

**Onde adicionar:**
- Se comprou na **Namecheap**: va em Domain List > Advanced DNS
- Se comprou no **Registro.br**: va em DNS > Zona
- Se usa **Cloudflare**: va em DNS > Records

### Passo 4: Verificar no Resend

Apos adicionar os registros, volte no Resend e clique em "Verify DNS Records". Pode levar ate 48h, mas geralmente e rapido (5-30 minutos).

### Passo 5: Atualizar o codigo

Quando o dominio estiver verificado, mude o `from` no `route.ts`:

```ts
// ANTES (teste - so aparece no painel):
from: `Portfolio Contact <onboarding@resend.dev>`,

// DEPOIS (real - chega no Gmail):
from: `Portfolio Contact <contato@seudominio.com>`,
```

---

## Como usar o template que voce criou

Voce criou um template em https://resend.com/templates. Pra usar no codigo, voce tem duas opcoes:

### Opcao A: Usar template inline (como ja esta)

O HTML do `route.ts` ja e um template inline. Funciona, mas e mais dificil de manter.

### Opcao B: Usar o template do painel do Resend

```ts
// Em vez de passar o HTML direto, passa o ID do template:
const { error } = await resend.emails.send({
  from: `Portfolio Contact <contato@seudominio.com>`,
  to: ['guilhermemenezes1337@gmail.com'],
  replyTo: email,
  templateId: 'id-do-template-do-painel',
  variables: {
    name: sanitizedName,
    email: email,
    subject: sanitizedSubject,
    message: sanitizedMessage,
  },
})
```

Pra encontrar o ID: va em https://resend.com/templates, clique no template e copie o ID.

### Opcao C: Melhorar o HTML inline (recomendado)

O HTML atual e basico. Vou melhorar ele pra ficar mais profissional:

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Nova mensagem do portfolio</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
    <p style="margin: 0 0 15px;"><strong>Nome:</strong> ${name}</p>
    <p style="margin: 0 0 15px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p style="margin: 0 0 15px;"><strong>Assunto:</strong> ${subject}</p>
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;" />
    <p style="margin: 0 0 10px;"><strong>Mensagem:</strong></p>
    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #667eea;">
      ${message.replace(/\n/g, '<br />')}
    </div>
  </div>
  <div style="background: #343a40; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="color: #adb5bd; margin: 0; font-size: 12px;">Enviado pelo formulario de contato do portfolio</p>
  </div>
</div>
```

---

## Plano Gratuito vs Pago

| Feature | Gratuito | Pago ($20/mes) |
|---------|----------|----------------|
| Emails por dia | 100 | 50,000 |
| Emails por mes | 3,000 | 1,000,000 |
| Dominios | 1 | Ilimitados |
| Suporte | Comunidade | Prioritario |

**Pro seu portfolio:** O plano gratuito e mais que suficiente. 100 emails/dia e muito pra um formulario de contato.

---

## Melhorias Futuras

### 1. Notificacao por WhatsApp (usando a API do WhatsApp Business)

```ts
// No route.ts, apos enviar o email:
const whatsappResponse = await fetch('https://graph.facebook.com/v18.0/SEU_NUMERO/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: '5511999999999',
    type: 'template',
    template: {
      name: 'nova_mensagem',
      language: { code: 'pt_BR' },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: name },
          { type: 'text', text: subject },
        ],
      }],
    },
  }),
})
```

**Custo:** WhatsApp Business API e pago (~$0.05 por mensagem). Precisa de conta verificada.

### 2. Notificacao por Telegram (gratis e mais facil)

```ts
// No route.ts, apos enviar o email:
await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: `Nova mensagem do portfolio!\n\nNome: ${name}\nEmail: ${email}\nAssunto: ${subject}\n\n${message}`,
  }),
})
```

**Custo:** Gratis. Precisa criar um bot no @BotFather.

### 3. Responder direto do Gmail (ja esta configurado)

O campo `replyTo: email` ja esta configurado. Quando voce receber o email no Gmail e clicar em "Responder", a resposta vai direto pra pessoa que preencheu o formulario.

### 4. Auto-responder pra quem enviou

```ts
// Enviar confirmacao pra pessoa:
await resend.emails.send({
  from: `Portfolio <contato@seudominio.com>`,
  to: [email],
  subject: 'Recebemos sua mensagem!',
  html: `<p>Oi ${name}, recebemos sua mensagem e vamos responder em breve!</p>`,
})
```

---

## Checklist pra colocar tudo pra funcionar

- [ ] Registrar dominio proprio (ex: guilhermemenezes.com)
- [ ] Adicionar dominio no Resend (https://resend.com/domains)
- [ ] Configurar registros DNS no provedor do dominio
- [ ] Verificar dominio no Resend
- [ ] Atualizar o `from` no `route.ts`
- [ ] Testar envio real
- [ ] (Opcional) Configurar Telegram/WhatsApp pra notificacao instantanea
- [ ] (Opcional) Melhorar o HTML do email
- [ ] (Opcional) Adicionar auto-resposta

---

## Links Uteis

- **Painel Resend:** https://resend.com
- **Documentacao:** https://resend.com/docs
- **Templates:** https://resend.com/templates
- **Dominios:** https://resend.com/domains
- **API Keys:** https://resend.com/api-keys
- **Logs de envio:** https://resend.com/emails
