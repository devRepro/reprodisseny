// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  //Definimos url
  runtimeConfig: {
    public: {
      siteUrl: 'http://localhost:3000' // Define la URL de producción
    }
  },
  
  //Importamos modulos necesarios
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image'
  ],
  
  //Cargamos esilos globales
  css: ['@/assets/styles/main.scss'],
  
  //Auto import componentes
  components: true, 
  
  //Definimos transiciones globales
  app: {
    pageTransition: {
      name: 'fade',
      mode: 'out-in' // default
    },
    layoutTransition: {
      name: 'slide',
      mode: 'out-in' // default
    }
  },
 
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },


  //configuración Tailwind
  tailwindcss: {
    configPath: 'tailwind.config.js',
    exposeConfig: true,
  },

})