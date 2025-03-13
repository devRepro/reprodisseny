// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  css: ['@/assets/styles/main.scss'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },


  //configuración Tailwind
  tailwindcss: {
    cssPath: '@/assets/css/tailwind.scss',
    configPath: 'tailwind.config.js',
    exposeConfig: true,
  }
})