import sgMail from '@sendgrid/mail'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validación básica
  if (!body?.email) {
    return { success: false, error: 'El campo email es obligatorio.' }
  }

  try {
    // Configurar SendGrid con tu API Key desde runtimeConfig
    sgMail.setApiKey(config.SENDGRID_API_KEY)

    // Construir el mensaje
    const msg = {
      to: 'jordi@reprodisseny.com', // destinatario
      from: config.SENDGRID_FROM,   // remitente verificado en SendGrid
      subject: 'Nuevo contacto desde tu sitio web',
      text: `Nombre: ${body.name || 'No especificado'}\nEmail: ${body.email}`,
      // Puedes agregar aquí `html:` si quieres un mensaje más visual
    }

    // Enviar el mensaje
    await sgMail.send(msg)

    return { success: true }
  } catch (error: any) {
    console.error('Error al enviar correo con SendGrid:', error?.response?.body || error.message)
    return { success: false, error: 'No se pudo enviar el mensaje. Intenta más tarde.' }
  }
})
