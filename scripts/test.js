// test.js
import { sendEmail } from './sendEmail.js'

const main = async () => {
  const result = await sendEmail({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    subject: 'Consulta desde el formulario',
    message: 'Hola, estoy interesado en sus productos.'
  })

  if (result.success) {
    console.log('Correo enviado exitosamente.')
  } else {
    console.error('Error al enviar el correo:', result.error)
  }
}

main()

