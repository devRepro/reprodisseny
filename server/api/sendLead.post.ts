// server/api/sendLead.post.ts
import { defineEventHandler, readBody, sendError, createError } from 'h3'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

console.log('[sendLead] handler cargado')
console.log('[sendLead] KEY defined?', Boolean(process.env.SENDGRID_API_KEY))

if (!process.env.SENDGRID_API_KEY) {
  throw createError({ statusCode: 500, statusMessage: 'Falta SENDGRID_API_KEY' })
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const schema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  comentario: z.string().optional(),
  producto: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  console.log(`[sendLead] ${event.node.req.method} ${event.node.req.url}`)

  if (event.node.req.method !== 'POST') {
    console.warn('[sendLead] método no permitido')
    return sendError(event, createError({ statusCode: 405, statusMessage: 'Sólo POST permitido' }))
  }

  const body = await readBody(event)
  console.log('[sendLead] body:', body)

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    console.error('[sendLead] validación fallida:', parsed.error.format())
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Datos inválidos',
      data: parsed.error.format()
    }))
  }
  const data = parsed.data

  try {
    console.log('[sendLead] enviando email a:', data.email)
    const result = await sgMail.send({
      to: 'jordi@reprodisseny.com',
      from: process.env.SENDGRID_FROM || 'noreply@example.com',
      subject: `Nueva solicitud de ${data.nombre}`,
      html: `<h3>Solicitud de información</h3>
             <p><strong>Producto:</strong> ${data.producto}</p>
             <p><strong>Nombre:</strong> ${data.nombre}</p>
             <p><strong>Email:</strong> ${data.email}</p>
             <p><strong>Mensaje:</strong> ${data.comentario || 'No especificado'}</p>`
    })
    console.log('[sendLead] SendGrid OK:', result)
  } catch (err: any) {
    console.error('[sendLead] SendGrid ERROR:', err.response?.body || err)
    return sendError(event, createError({ statusCode: 502, statusMessage: 'Error al enviar email' }))
  }

  console.log('[sendLead] finalizado con éxito')
  return { success: true }
})
