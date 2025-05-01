import { defineNuxtConfig } from 'nuxt/config'

// Define valores globales una vez para reutilizar
const siteName = 'Reprodisseny';
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Fallback para desarrollo
const twitterHandle = '@reprodisseny'; // Tu handle de Twitter
const defaultOgImage = `${siteUrl}/og-image.jpg`; // Imagen OG por defecto (asegúrate que exista)
const defaultDescription = 'Impresión digital y offset para empresas y agencias en Cataluña. Catálogos, packaging, gran formato y más.';

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt'
    // Considera añadir más tarde si los necesitas:
    // '@nuxtjs/robots',
    // '@nuxtjs/sitemap',
  ],

  runtimeConfig: {
    // --- Configuración del Servidor (privada) ---
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    sendgridFromEmail: process.env.SENDGRID_FROM,
    sendgridToEmail: process.env.SENDGRID_TO,
    // --- Configuración Pública (accesible en cliente y servidor) ---
    public: {
      // Necesario para que useSeoContent construya URLs absolutas
      siteUrl: siteUrl,
      // Opcional: Si usas el nombre del sitio en el cliente
      // siteName: siteName,
    }
  },

  app: {
    head: {
      // --- Configuración Global del HEAD ---
      // Establece defaults que useSeoContent puede sobrescribir.

      // Plantilla para el título: '%s' será reemplazado por el título específico de la página
      titleTemplate: `%s · ${siteName}`,
      // Título por defecto (ej: para la página principal o si una página no define título)
      title: `${siteName} | Impresión profesional en Cataluña`,
      htmlAttrs: {
        lang: 'es' // Idioma principal del sitio
      },
      meta: [
        // --- Esenciales ---
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Descripción por defecto (useSeoContent la sobrescribirá)
        { name: 'description', content: defaultDescription },

        // --- Open Graph Defaults ---
        // Estos serán sobrescritos por useSeoContent si la página tiene datos específicos
        { property: 'og:site_name', content: siteName },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:image', content: defaultOgImage }, // Imagen por defecto
        { property: 'og:image:width', content: '1200' },   // Opcional: Dimensiones imagen OG
        { property: 'og:image:height', content: '630' },   // Opcional: Dimensiones imagen OG
        // { property: 'og:type', content: 'website' }, // Tipo por defecto (website), 'article' o 'product' se definirá en la página

        // --- Twitter Defaults ---
        // Estos serán sobrescritos por useSeoContent
        { name: 'twitter:card', content: 'summary_large_image' }, // Tipo de tarjeta
        { name: 'twitter:site', content: twitterHandle }, // @usuario de Twitter del sitio
        { name: 'twitter:image', content: defaultOgImage }, // Imagen por defecto para Twitter

        // --- Otros Opcionales ---
        // { name: 'author', content: siteName },
        // { name: 'theme-color', content: '#ffffff' }, // Color para la barra de navegación móvil
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // El link rel="canonical" es MEJOR definirlo por página usando useSeoContent,
        // ya que cada página debe tener su propia URL canónica.
        // No se recomienda un canonical global a menos que sea para la raíz.
      ]
    },
    // --- Transiciones (sin cambios) ---
    pageTransition: { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'slide', mode: 'out-in' }
  },

  // --- Resto de la configuración (sin cambios) ---
  css: ['@/assets/styles/main.scss'],
  components: [ { path: '~/components/ui', extensions: ['vue'], ignore: ['**/index.ts'], prefix: 'Ui' }, { path: '~/components', extensions: ['vue'], ignore: ['ui/**'] } ],
  image: { provider: 'ipx', screens: { sm: 320, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }, dir: 'public' },
  alias: { '@components': '/components', '@assets': '/assets', '@utils': '/utils', '@types': '/types' },
  tailwindcss: { configPath: 'tailwind.config.ts', exposeConfig: true },
  colorMode: { preference: 'light', fallback: 'light', classSuffix: '' },
  build: { transpile: ['unicorn-magic'] },
  vite: { optimizeDeps: { include: ['unicorn-magic'] }, ssr: { noExternal: ['unicorn-magic'] }, resolve: { alias: { 'unicorn-magic$': 'unicorn-magic/dist/unicorn-magic.cjs.js' } } },
  compatibilityDate: '2025-04-27',
  devtools: { enabled: true }
})