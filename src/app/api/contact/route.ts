import { Resend } from 'resend'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

const requestCounts: { [ip: string]: { count: number; timestamp: number } } = {}
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_SUBJECT_LENGTH = 200

/**
 * Escapa texto para interpolação segura em corpo HTML.
 * O `&` precisa ser substituído primeiro para não escapar as entidades geradas depois.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Normaliza o assunto para uso como header de texto puro:
 * remove quebras de linha (header injection), colapsa espaços e limita o tamanho.
 */
function sanitizeSubject(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SUBJECT_LENGTH)
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Skipping email send.')
    return new Response(
      JSON.stringify({
        message:
          'Message received. Email sending is disabled on this environment (missing RESEND_API_KEY).',
      }),
      { status: 200 },
    )
  }

  const resend = new Resend(apiKey)
  const clientIp =
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

  const now = Date.now()
  if (requestCounts[clientIp]) {
    const { count, timestamp } = requestCounts[clientIp]
    if (now - timestamp < RATE_LIMIT_WINDOW) {
      if (count >= RATE_LIMIT) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429 },
        )
      }
      requestCounts[clientIp].count += 1
    } else {
      requestCounts[clientIp] = { count: 1, timestamp: now }
    }
  } else {
    requestCounts[clientIp] = { count: 1, timestamp: now }
  }

  const body = await req.json()
  const { name, email, subject, message } = body as FormData

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email ||
    !subject.trim() ||
    !message.trim()
  ) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 })
  }

  if (!/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400 })
  }

  // O assunto é um header de texto puro: não deve receber entidades HTML.
  const safeSubject = sanitizeSubject(subject)
  // Os valores abaixo entram apenas no corpo HTML e são escapados por contexto.
  const htmlName = escapeHtml(name.trim())
  const htmlEmail = escapeHtml(email)
  const htmlSubject = escapeHtml(safeSubject)
  const htmlMessage = escapeHtml(message).replace(/\n/g, '<br />')

  try {
    const { error } = await resend.emails.send({
      from: `Portfolio Contact <onboarding@resend.dev>`,
      to: ['guilhermemenezes1337@gmail.com'],
      replyTo: email,
      subject: safeSubject,
      html: `
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${htmlName}</p>
  <p><strong>Email:</strong> <a href="mailto:${htmlEmail}">${htmlEmail}</a></p>
  <p><strong>Subject:</strong> ${htmlSubject}</p>
  <p><strong>Message:</strong></p>
  <blockquote style="margin-left:1rem; border-left: 2px solid #ccc; padding-left: 1rem;">
    ${htmlMessage}
  </blockquote>
  <hr />
  <p style="font-size: 0.85rem; color: #666;">Sent via portfolio contact form</p>
`,
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Message sent successfully' }), { status: 200 })
  } catch (err) {
    console.error('Error sending email:', err)
    return new Response(JSON.stringify({ error: 'An error occurred while sending the email' }), {
      status: 500,
    })
  }
}
