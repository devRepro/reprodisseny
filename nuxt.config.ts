// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default defineNuxtConfig({
  runtimeConfig: {
    gbp: {
      clientId: process.env.NUXT_GBP_CLIENT_ID,
      clientSecret: process.env.NUXT_GBP_CLIENT_SECRET,
      redirectUri: process.env.NUXT_GBP_REDIRECT_URI,
      account: process.env.NUXT_GBP_ACCOUNT,
      location: process.env.NUXT_GBP_LOCATION
    },

    public: {
      siteUrl,
       googlePlaceId: process.env.NUXT_PUBLIC_GOOGLE_PLACE_ID || process.env.NUXT_GOOGLE_PLACE_ID
    }
  },

  appConfig: {
    brand: { logoUrl: '/img/logo/logo.svg' }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    'shadcn-nuxt'
  ],

  css: ['@/assets/styles/main.scss'],

  shadcn: {
    prefix: '',
    componentDir: 'components/ui'
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      titleTemplate: '%s · Reprodisseny',
      title: 'Impresión profesional en Cataluña',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Impresión profesional en Cataluña: gran formato, PLV, vinilos, calendarios y más, con asesoramiento experto.' },
        { property: 'og:site_name', content: 'Reprodisseny' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `${siteUrl}/img/logo/logo.svg` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${siteUrl}/img/logo/logo.svg` },
        { name: 'theme-color', content: '#111827' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/img/logo/logo.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/logo/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/logo/apple-touch-icon.png' }
      ]
    },
    pageTransition:   { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'slide', mode: 'out-in' }
  },

  tailwindcss: { configPath: 'tailwind.config.js', exposeConfig: true },
  colorMode:   { preference: 'light', fallback: 'light', classSuffix: '' },

  routeRules: {
    // Páginas de categorías: prerender + revalidación cada hora (SEO + TTFB)
    '/categorias/**': { isr: 3600 },

    // API de categorías: cache SWR 1h (sirve stale y revalida en background)
    '/api/categorias/**': { swr: 3600 },

    // Compatibilidad con rutas antiguas del logo
    '/img/logo.svg': { redirect: { to: '/img/logo/logo.svg', statusCode: 301 } }
  },

  compatibilityDate: '2025-06-01',
  devtools: { enabled: true }
})
