import { defineNuxtConfig } from 'nuxt/config'
// nuxt.config.ts
import { fileURLToPath } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  runtimeConfig: {
    microsoftGraphClientSecret: process.env.GRAPH_SECRET,
    tenantId:                  process.env.AZURE_TENANT_ID,
    clientId:                  process.env.AZURE_CLIENT_ID,
    sharepointSiteId:          process.env.SHAREPOINT_SITE_ID,
    sendgridApiKey:            process.env.SENDGRID_API_KEY,
    sendgridFrom:              process.env.SENDGRID_FROM || 'noreply@reprodisseny.com',
    // Instagram
    igToken:  process.env.NUXT_IG_TOKEN,
    igUserId: process.env.NUXT_IG_IG_USER_ID,
    igApiVer: process.env.NUXT_IG_API_VER || 'v20.0',
    // Google
    gmapsApiKey: process.env.NUXT_GMAPS_API_KEY,
    public: {
      siteUrl:      process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      gmapsPlaceId: process.env.NUXT_PUBLIC_GMAPS_PLACE_ID || ''
    }
  },

  modules: [
    '@nuxt/content',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image',
    'shadcn-nuxt',
    '@nuxt/ui',
  ],

  css: ['@/assets/styles/main.scss'],

  shadcn: {
    prefix: '',
    componentDir: 'components/ui',
  },

  components: [
    { path: '~/components', pathPrefix: true }
  ],

  app: {
    head: {
      titleTemplate: '%s · Reprodisseny',
      title: 'Impresión profesional en Cataluña',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    pageTransition:   { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'slide', mode: 'out-in' }
  },

  alias: {
    '@components': resolvePath(dir, './components'),
    '@assets':     resolvePath(dir, './assets'),
    '@utils':      resolvePath(dir, './utils'),
    '@types':      resolvePath(dir, './types'),
  },

  tailwindcss: { configPath: 'tailwind.config.js', exposeConfig: true },
  colorMode:   { preference: 'light', fallback: 'light', classSuffix: '' },

  build: {
    transpile: ['unicorn-magic'],
  },

  vite: {
    optimizeDeps: { include: ['unicorn-magic'] },
    ssr:          { noExternal: ['unicorn-magic'] },
    resolve: {
      alias: { 'unicorn-magic$': 'unicorn-magic/dist/unicorn-magic.cjs.js' }
    }  
  },
  
  nitro: {
    routeRules: {
      '/categorias/**':      { swr: true },
      '/api/categorias/**':  { swr: true, cache: { maxAge: 3600 } },
    }
  },

  compatibilityDate: '2025-06-01',
  devtools: { enabled: true },
})