// types/plugins.d.ts
export {}

declare module '#app' {
  interface NuxtApp {
    $notify: {
      show: (t: string, o?: any) => void
      success: (t: string, d?: string, o?: any) => void
      error: (t: string, d?: string, o?: any) => void
      info: (t: string, d?: string, o?: any) => void
      promise: typeof import('vue-sonner').toast.promise
    }
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $notify: NuxtApp['$notify']
  }
}
