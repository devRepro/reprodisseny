// plugins/notify.client.ts
import { defineNuxtPlugin } from '#app'
import { toast } from 'vue-sonner'

export default defineNuxtPlugin(() => {
  const notify = {
    show: (t: string, o?: any) => toast(t, o),
    success: (t: string, d?: string, o?: any) => toast.success(t, { description: d, ...(o || {}) }),
    error: (t: string, d?: string, o?: any) => toast.error(t, { description: d, ...(o || {}) }),
    info: (t: string, d?: string, o?: any) => toast.message(t, { description: d, ...(o || {}) }),
    promise: toast.promise
  }
  return { provide: { notify } }
})
