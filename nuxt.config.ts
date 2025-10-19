// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default defineNuxtConfig({
  runtimeConfig: {

    mail: {
      // 'graph' (recomendado) o 'smtp'
      provider: process.env.MAIL_PROVIDER, // 'graph' | 'smtp'
      // Graph
      senderUpn: process.env.MAIL_SENDER_UPN, // p.ej. 'ventas@tu-dominio.com'
      to: process.env.MAIL_TO,               // destinatario
      // SMTP (si lo usas)
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === '1',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },
    // 🔒 Server-only (no expuesto al cliente)
    ms: {
      // Azure Entra ID (app de Graph - client credentials)
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,

      // SharePoint site (usa siteId si lo tienes; si no, host+path)
      siteId: process.env.GRAPH_SITE_ID || '',
      siteHostname: process.env.SHAREPOINT_HOSTNAME || 'reprodisseny.sharepoint.com',
      sitePath: process.env.SHAREPOINT_SITE_PATH || '/sites/portal',

      // Lista principal (Price Requests)
      listId: process.env.PRICE_REQUESTS_LIST_ID, // GUID
      // listDisplayName: '' // (no lo usamos si tenemos listId)
    },
    // Campos fijos para escribir en las listas (nombres internos de SP)
    crm: {
      // Lista principal
      emailField: process.env.PR_EMAIL_FIELD || 'Email',
      productField: process.env.PR_PRODUCT_FIELD || 'Producto',
      commentsField: process.env.PR_COMMENTS_FIELD || 'Comentarios',
      dateField: process.env.PR_DATE_FIELD || '',          // opcional
      phoneField: process.env.PR_PHONE_FIELD || '',        // opcional
      companyField: process.env.PR_COMPANY_FIELD || '',    // opcional

    

      // Lista de comentarios (PriceRequestComments)
      commentsListId: process.env.GRAPH_PRICE_REQUESTS_COMMENTS_LIST_ID || '',
      commentsParentIdField: process.env.PRC_PARENT_ID_FIELD || 'ParentId',
      commentsBodyField: process.env.PRC_BODY_FIELD || 'Body',
      commentsKindField: process.env.PRC_KIND_FIELD || 'Kind',
      commentsMetaField: process.env.PRC_META_FIELD || 'Meta',

      originField:    process.env.PR_ORIGIN_FIELD || '',
      utmField:       process.env.PR_UTM_FIELD || '',
      quantityField:  process.env.PR_QUANTITY_FIELD || '',
      attributesField:process.env.PR_ATTRIBUTES_FIELD || ''
    },

    // Puedes mantener este bloque si lo usas (Google Business Profile)
    gbp: {
      gbpAccount: process.env.NUXT_GBP_ACCOUNT,
      gbpLocation: process.env.NUXT_GBP_LOCATION,
      gbpClientId: process.env.NUXT_GBP_CLIENT_ID,
      gbpClientSecret: process.env.NUXT_GBP_CLIENT_SECRET,
      gbpRedirectUri: process.env.NUXT_GBP_REDIRECT_URI,
      gbpDisableList: process.env.NUXT_GBP_DISABLE_LIST === '1',
    },

    // 🌐 Public (lo que el cliente puede leer)
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      // Sólo expón lo mínimo. Si el cliente necesita leerlos, OK:
    },
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
    'vue-sonner/nuxt',
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
