// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  runtimeConfig: {
    microsoftGraphClientSecret: process.env.GRAPH_SECRET,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    sharepointSiteId: process.env.SHAREPOINT_SITE_ID,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    sendgridFrom: process.env.SENDGRID_FROM || 'noreply@reprodisseny.com',
  
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    }
  },


  modules: ['@nuxt/content', '@pinia/nuxt','@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/icon', '@nuxt/image', '@nuxtjs/seo'],

  css: ['@/assets/styles/main.scss'],

  components: [
    // 1) Carpeta UI con prefijo Ui (ignora index.ts)
    {
      path: '~/components/ui',
      extensions: ['vue'],
      ignore: ['**/index.ts'],
      prefix: 'Ui'
    },
    // 2) Resto de components sin prefijo, ignorando ya la carpeta ui
    {
      path: '~/components',
      extensions: ['vue'],
      ignore: ['ui/**']
    }
  ],

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
        { property: 'og:description', content: 'Catálogos, adhesivos, expositores, packaging... todo que tu empresa necesita con calidad y rapidez.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: process.env.NUXT_PUBLIC_SITE_URL || 'https://reprodisseny.com' },
        { property: 'og:image', content: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://reprodisseny.com'}/og-image.jpg` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Reprodisseny · Impresión profesional' },
        { name: 'twitter:description', content: 'Tu imprenta en Cataluña para proyectos de calidad.' },
        { name: 'twitter:image', content: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://reprodisseny.com'}/og-image.jpg` }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'slide', mode: 'out-in' }
  },

  alias: {
    '@components': '/components',
    '@assets': '/assets',
    '@utils': '/utils',
    '@types': '/types'
  },

  tailwindcss: { configPath: 'tailwind.config.ts', exposeConfig: true },

  colorMode: { preference: 'light', fallback: 'light', classSuffix: '' },

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

  compatibilityDate: '2025-04-27',
  devtools: { enabled: true },
  
}

)