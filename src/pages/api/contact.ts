import type { APIRoute } from 'astro'

interface ContactPayload {
  name:    string
  email:   string
  subject: string
  message: string
  phone?:  string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildHtml(data: ContactPayload): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#E8222B;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:20px">Nuevo mensaje de contacto</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">GrafiVisión · grafivision.com.co</p>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #E4E4E4">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#737373;font-size:13px;width:100px">Nombre</td>
              <td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#737373;font-size:13px">Email</td>
              <td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#E8222B">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#737373;font-size:13px">Teléfono</td>
              <td style="padding:8px 0">${data.phone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#737373;font-size:13px">Asunto</td>
              <td style="padding:8px 0">${data.subject}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #E4E4E4;margin:20px 0">
        <p style="color:#737373;font-size:13px;margin:0 0 8px">Mensaje:</p>
        <p style="white-space:pre-wrap;line-height:1.6;margin:0">${data.message}</p>
      </div>
      <p style="text-align:center;color:#737373;font-size:12px;padding:16px">
        GrafiVisión · Colombia · <a href="https://grafivision.com.co" style="color:#E8222B">grafivision.com.co</a>
      </p>
    </div>
  `
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as Partial<ContactPayload>
    const { name, email, subject, message, phone } = body

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Por favor completa todos los campos requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico no es válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (message.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'El mensaje es demasiado corto.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload: ContactPayload = { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(), phone: phone?.trim() }

    const apiKey  = import.meta.env.RESEND_API_KEY
    const emailTo = import.meta.env.CONTACT_EMAIL_TO ?? 'info@grafivision.com.co'

    if (apiKey) {
      // Send via Resend (pnpm add resend)
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)

      const { error } = await resend.emails.send({
        from:     'GrafiVisión Web <no-reply@grafivision.com.co>',
        to:       [emailTo],
        replyTo:  payload.email,
        subject:  `[Web] ${payload.subject}`,
        html:     buildHtml(payload),
      })

      if (error) {
        console.error('[contact] Resend error:', error)
        return new Response(
          JSON.stringify({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Dev fallback: log to console
      console.log('[contact] RESEND_API_KEY not set — mensaje recibido:', payload)
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
