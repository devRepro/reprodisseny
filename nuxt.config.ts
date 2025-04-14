import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  runtimeConfig: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM: process.env.SENDGRID_FROM,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  css: ['@/assets/styles/main.scss'],

  components: true,

  app: {
    head: {
      titleTemplate: '%s · Reprodisseny',
      title: 'Impresión profesional en Cataluña',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Impresión digital y offset para empresas y agencias en Cataluña. Catálogos, packaging, gran formato y más.' },
        { name: 'author', content: 'Reprodisseny' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Impresión profesional en Cataluña · Reprodisseny' },
        { property: 'og:description', content: 'Catálogos, adhesivos, expositores, packaging... todo lo que tu empresa necesita con calidad y rapidez.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://reprodisseny.com' },
        { property: 'og:image', content: 'https://reprodisseny.com/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Reprodisseny · Impresión profesional' },
        { name: 'twitter:description', content: 'Tu imprenta en Cataluña para proyectos de calidad.' },
        { name: 'twitter:image', content: 'https://reprodisseny.com/og-image.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: {
      name: 'fade',
      mode: 'out-in'
    },
    layoutTransition: {
      name: 'slide',
      mode: 'out-in'
    }
  },

  alias: {
    '@components': '/components',
    '@assets': '/assets',
    '@utils': '/utils',
    '@types': '/types',
  },

  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    exposeConfig: true
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  }
  
})
