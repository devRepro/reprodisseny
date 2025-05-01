// sendEmail.js (ESM compatible)
import sgMail from '@sendgrid/mail'
import 'dotenv/config'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async ({ name, email, subject, message }) => {
  const msg = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: subject || 'Nuevo mensaje de contacto',
    text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
    html: `
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br/>${message}</p>
    `
  }

  try {
    const response = await sgMail.send(msg)
    console.log('Correo enviado:', response[0].statusCode)
    return { success: true }
  } catch (error) {
    console.error('Error al enviar el correo:', error)
    return { success: false, error }
  }
}
