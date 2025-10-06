// types/nuxt.d.ts
export {}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    gmapsApiKey?: string
  }
  interface PublicRuntimeConfig {
    gmapsPlaceId: string
  }
}
