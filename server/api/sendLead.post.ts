// server/api/sendLead.post.ts
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const schema = z.object({
  nombre: z.string(),
  email: z.string().email(),
  comentario: z.string().optional(),
  producto: z.string()
})

export default defineEventHandler(async (event:any) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Datos inválidos' }))
  }

  const data = parsed.data

  // 1. Enviar email
  await sgMail.send({
    to: 'jordi@reprodisseny.com',
    from: 'jordi@reprodisseny.com',
    subject: `Nueva solicitud de ${data.nombre}`,
    html: `
      <h3>Solicitud de información</h3>
      <p><strong>Producto:</strong> ${data.producto}</p>
      <p><strong>Nombre:</strong> ${data.nombre}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Mensaje:</strong> ${data.comentario || 'No especificado'}</p>
    `
  })

  // 2. Guardar en archivo .json
  const leadsPath = path.resolve('data', 'leads.json')
  let leads = []

  try {
    const file = await fs.readFile(leadsPath, 'utf8')
    leads = JSON.parse(file)
  } catch {
    leads = []
  }

  leads.push({ ...data, fecha: new Date().toISOString() })

  await fs.mkdir(path.dirname(leadsPath), { recursive: true })
  await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), 'utf8')

  return { success: true }
})
