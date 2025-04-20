import { ref } from 'vue'

export function useInquiryForm() {
  const name = ref('')
  const email = ref('')
  const message = ref('')
  const sending = ref(false)

  async function submit() {
    sending.value = true
    // Aquí llamarías a tu API (SendGrid, Netlify Function, etc.)
    await fetch('/api/inquiry', { method:'POST', body: JSON.stringify({ name:name.value, email:email.value, message:message.value }) })
    // Reset
    name.value = email.value = message.value = ''
    sending.value = false
  }

  return { name, email, message, sending, submit }
}
