// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Configuración de variables de entorno
  runtimeConfig: {
    microsoftGraphClientSecret: process.env.GRAPH_SECRET,
    tenantId:                  process.env.AZURE_TENANT_ID,
    clientId:                  process.env.AZURE_CLIENT_ID,
    sharepointSiteId:          process.env.SHAREPOINT_SITE_ID,
    sendgridApiKey:            process.env.SENDGRID_API_KEY,
    sendgridFrom:              process.env.SENDGRID_FROM || 'noreply@reprodisseny.com',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    }
  },

  // Módulos sin nada de SEO
  modules: [
    '@nuxt/content',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  // Estilos globales
  css: ['@/assets/styles/main.scss'],

  // Auto-import de componentes
  components: [
  
    {
      path:      '~/components',
      extensions:['vue'],
    },
    {
      path:      '~/components/views',
      extensions:['vue'],
      prefix:    'View'
    }
  ],

  // Head global mínimo
  app: {
    head: {
      titleTemplate: '%s · Reprodisseny',
      title:         'Impresión profesional en Cataluña',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition:   { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'slide', mode: 'out-in' }
  },

  // Alias de carpetas
  alias: {
    '@components': '/components',
    '@assets':     '/assets',
    '@utils':      '/utils',
    '@types':      '/types'
  },

  // TailwindCSS
  tailwindcss: { configPath: 'tailwind.config.js', exposeConfig: true },

  // Color mode
  colorMode: { preference: 'light', fallback: 'light', classSuffix: '' },

  // Build / Vite
  build: { transpile: ['unicorn-magic'] },
  vite: {
    optimizeDeps: { include: ['unicorn-magic'] },
    ssr: { noExternal: ['unicorn-magic'] },
    resolve: {
      alias: {
        'unicorn-magic$': 'unicorn-magic/dist/unicorn-magic.cjs.js'
      }
    }
  },

  // Nitro (SSG + SWR para categorías)
  nitro: {
    preset: 'static',
    routeRules: {
      '/categorias/**': { swr: true }
    }
  },

  compatibilityDate: '2025-04-27',
  devtools:          { enabled: true },
})
