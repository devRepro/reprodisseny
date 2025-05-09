export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validación mínima obligatoria
  if (!body.nombre || !body.email) {
    return { status: 'error', message: 'Faltan campos requeridos' }
  }

  const config = useRuntimeConfig()
  const sendgridApiKey = config.sendgridApiKey
  const fromEmail = config.sendgridFrom || 'no-reply@reprodisseny.com'
  const toEmail = 'jordi@reprodisseny.com'

  // Construcción segura del mensaje
  const contenidoTexto = `
📝 NUEVA SOLICITUD DE PRESUPUESTO

Producto: ${body.producto || 'Sin especificar'}
Nombre: ${body.nombre}
Email: ${body.email}
Teléfono: ${body.telefono || 'No proporcionado'}
Cantidad: ${body.cantidad || '1'}
Comentario: ${body.comentario || 'Sin comentarios'}
`

  try {
    await $fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        personalizations: [
          {
            to: [{ email: toEmail }],
            subject: `📩 Solicitud de presupuesto: ${body.producto || 'Producto'}`
          }
        ],
        from: { email: fromEmail, name: 'Reprodisseny Web' },
        content: [
          {
            type: 'text/plain',
            value: contenidoTexto.trim()
          }
        ]
      },
      parseResponse: () => '' // evita error de ReadableStream en respuesta vacía
    })

    return { status: 'ok', message: 'Correo enviado correctamente' }
  } catch (error: any) {
    const detalle = error?.response?._data || error.message || error
    console.error('❌ Error al enviar email:', detalle)
    return { status: 'error', message: 'No se pudo enviar el correo', detalle }
  }
})
