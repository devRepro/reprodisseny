export default defineEventHandler(async (event) => {
    const body = await readBody(event)
  
    if (!body.nombre || !body.email) {
      return { status: 'error', message: 'Faltan campos requeridos' }
    }
  
    const config = useRuntimeConfig()
    const sendgridApiKey = config.sendgridApiKey
    const fromEmail = config.sendgridFrom || 'no-reply@reprodisseny.com'
    const toEmail = 'jordi@reprodisseny.com'
  
    const camposBase = ['nombre', 'email', 'telefono', 'cantidad', 'producto', 'comentario', 'acepta']
  
    const camposDinamicos = Object.entries(body)
      .filter(([key]) => !camposBase.includes(key))
      .map(([key, value]) => `• ${capitalizar(key)}: ${value || '-'}`)
      .join('\n')
  
    const camposDinamicosHTML = Object.entries(body)
      .filter(([key]) => !camposBase.includes(key))
      .map(([key, value]) => `<li><strong>${capitalizar(key)}:</strong> ${value || '-'}</li>`)
      .join('')
  
    const contenidoTexto = `
  📝 NUEVA SOLICITUD DE PRESUPUESTO
  
  Producto: ${body.producto || 'Sin especificar'}
  Nombre: ${body.nombre}
  Email: ${body.email}
  Teléfono: ${body.telefono || 'No proporcionado'}
  Cantidad: ${body.cantidad || '1'}
  Comentario: ${body.comentario || 'Sin comentarios'}
  
  ${camposDinamicos ? `Campos adicionales:\n${camposDinamicos}` : ''}
  `.trim()
  
    const contenidoHTML = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">📩 Nueva solicitud de presupuesto</h2>
  
      <p><strong>Producto:</strong> ${body.producto || 'Sin especificar'}</p>
      <p><strong>Nombre:</strong> ${body.nombre}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Teléfono:</strong> ${body.telefono || 'No proporcionado'}</p>
      <p><strong>Cantidad:</strong> ${body.cantidad || '1'}</p>
  
      <p><strong>Comentario:</strong><br>${body.comentario || 'Sin comentarios'}</p>
  
      ${camposDinamicosHTML ? `
      <h3 style="margin-top: 20px;">🎯 Campos adicionales:</h3>
      <ul style="padding-left: 1rem;">
        ${camposDinamicosHTML}
      </ul>
      ` : ''}
    </div>
    `.trim()
  
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
              subject: `🧾 Presupuesto solicitado: ${body.producto || 'Producto'}`
            }
          ],
          from: { email: fromEmail, name: 'Reprodisseny Web' },
          content: [
            {
              type: 'text/plain',
              value: contenidoTexto
            },
            {
              type: 'text/html',
              value: contenidoHTML
            }
          ]
        },
        parseResponse: () => ''
      })
  
      return { status: 'ok', message: 'Correo enviado correctamente' }
    } catch (error: any) {
      const detalle = error?.response?._data || error.message || error
      console.error('❌ Error al enviar email:', detalle)
      return { status: 'error', message: 'No se pudo enviar el correo', detalle }
    }
  })
  
  function capitalizar(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).replace(/[_-]/g, ' ')
  }