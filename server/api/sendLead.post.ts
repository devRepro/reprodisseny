// server/api/sendLead.post.ts
import { defineEventHandler, readBody, sendError, createError } from 'h3'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import { Producto } from '~/types' // usa tu sistema de tipos actual

// Usamos runtimeConfig en vez de process.env directamente
export default defineEventHandler(async (event:any) => {
  const config = useRuntimeConfig()

  // Validación de clave SendGrid
  if (!config.sendgridApiKey) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Falta SendGrid API Key' }))
  }

  sgMail.setApiKey(config.sendgridApiKey)

  // Zod schema compatible con tus estructuras
  const schema = z.object({
    nombre: z.string().min(1),
    email: z.string().email(),
    telefono: z.string().optional(),
    comentario: z.string().optional(),
    producto: z.string().min(1),
    formFields: z.array(z.object({
      label: z.string(),
      name: z.string(),
      type: z.enum(['text', 'number', 'select']),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    })).optional()
  })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Datos inválidos',
      data: parsed.error.format()
    }))
  }

  const { nombre, email, telefono, comentario, producto, formFields } = parsed.data

  // Email dinámico en HTML a partir de formFields si vienen
  const extraFieldsHtml = formFields?.map((field:any) => {
    return `<p><strong>${field.label}:</strong> ${body[field.name] || 'No especificado'}</p>`
  }).join('\n') || ''

  try {
    await sgMail.send({
      to: 'jordi@reprodisseny.com',
      from: config.sendgridFrom || 'noreply@reprodisseny.com',
      subject: `📩 Nueva solicitud: ${producto} de ${nombre}`,
      html: `
        <h2>Solicitud de presupuesto</h2>
        <p><strong>Producto:</strong> ${producto}</p>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
        ${comentario ? `<p><strong>Comentario:</strong> ${comentario}</p>` : ''}
        ${extraFieldsHtml}
      `
    })

    return { success: true, message: 'Solicitud enviada correctamente' }
  } catch (err: any) {
    console.error('[sendLead] Error al enviar:', err.response?.body || err)
    return sendError(event, createError({ statusCode: 502, statusMessage: 'Error al enviar email' }))
  }
})
