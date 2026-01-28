// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config"

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default defineNuxtConfig({
  runtimeConfig: {
    mail: {
      provider: process.env.MAIL_PROVIDER, // 'graph' | 'smtp'
      senderUpn: process.env.MAIL_SENDER_UPN,
      to: process.env.MAIL_TO,

      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "1",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },

    // ✅ SOLO credenciales (compartidas CRM + CMS)
    ms: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },

    // ✅ Targets SharePoint por contexto
    sharepoint: {
      // --- CRM (portal) ---
      crm: {
        // prioriza nuevos env si existen, si no usa los legacy para no romper
        siteId: process.env.CRM_SITE_ID || process.env.GRAPH_SITE_ID || "",
        siteHostname:
          process.env.CRM_SITE_HOSTNAME ||
          process.env.SHAREPOINT_HOSTNAME ||
          "reprodisseny.sharepoint.com",
        sitePath:
          process.env.CRM_SITE_PATH ||
          process.env.SHAREPOINT_SITE_PATH ||
          "/sites/portal",

        // lista principal (Solicitudes de precios)
        listId:
          process.env.CRM_PRICE_REQUESTS_LIST_ID ||
          process.env.PRICE_REQUESTS_LIST_ID ||
          "",

        // si usas lista de comentarios, la dejas aquí también (opcional)
        commentsListId:
          process.env.CRM_PRICE_REQUESTS_COMMENTS_LIST_ID ||
          process.env.GRAPH_PRICE_REQUESTS_COMMENTS_LIST_ID ||
          "",
      },

      // --- CMS (site de comunicación) ---
      cms: {
        siteId: process.env.CMS_SITE_ID || "",
        siteHostname:
          process.env.CMS_SITE_HOSTNAME || "reprodisseny.sharepoint.com",
        sitePath: process.env.CMS_SITE_PATH || "",

        // 👇 ids de listas CMS (para que los servicios los lean de aquí)
        categoriesListId: process.env.CMS_CATEGORIES_LIST_ID || "",
        productsListId: process.env.CMS_PRODUCTS_LIST_ID || "",
        assetsListId: process.env.CMS_ASSETS_LIST_ID || "",
      },
    },

    // ✅ Campos internos CRM (tal como lo tienes)
    crm: {
      emailField: process.env.CRM_PR_EMAIL_FIELD || process.env.PR_EMAIL_FIELD || "Email",
      productField: process.env.CRM_PR_PRODUCT_FIELD || process.env.PR_PRODUCT_FIELD || "Producto",
      commentsField: process.env.CRM_PR_COMMENTS_FIELD || process.env.PR_COMMENTS_FIELD || "Comentarios",
      dateField: process.env.CRM_PR_DATE_FIELD || process.env.PR_DATE_FIELD || "",
      phoneField: process.env.CRM_PR_PHONE_FIELD || process.env.PR_PHONE_FIELD || "",
      companyField: process.env.CRM_PR_COMPANY_FIELD || process.env.PR_COMPANY_FIELD || "",

      commentsListId:
        process.env.CRM_PRICE_REQUESTS_COMMENTS_LIST_ID ||
        process.env.GRAPH_PRICE_REQUESTS_COMMENTS_LIST_ID ||
        "",

      commentsParentIdField:
        process.env.CRM_PRC_PARENT_ID_FIELD || process.env.PRC_PARENT_ID_FIELD || "ParentId",
      commentsBodyField:
        process.env.CRM_PRC_BODY_FIELD || process.env.PRC_BODY_FIELD || "Body",
      commentsKindField:
        process.env.CRM_PRC_KIND_FIELD || process.env.PRC_KIND_FIELD || "Kind",
      commentsMetaField:
        process.env.CRM_PRC_META_FIELD || process.env.PRC_META_FIELD || "Meta",

      originField: process.env.CRM_PR_ORIGIN_FIELD || process.env.PR_ORIGIN_FIELD || "",
      utmField: process.env.CRM_PR_UTM_FIELD || process.env.PR_UTM_FIELD || "",
      quantityField: process.env.CRM_PR_QUANTITY_FIELD || process.env.PR_QUANTITY_FIELD || "",
      attributesField: process.env.CRM_PR_ATTRIBUTES_FIELD || process.env.PR_ATTRIBUTES_FIELD || "",
    },

    gbp: {
      gbpAccount: process.env.NUXT_GBP_ACCOUNT,
      gbpLocation: process.env.NUXT_GBP_LOCATION,
      gbpClientId: process.env.NUXT_GBP_CLIENT_ID,
      gbpClientSecret: process.env.NUXT_GBP_CLIENT_SECRET,
      gbpRedirectUri: process.env.NUXT_GBP_REDIRECT_URI,
      gbpDisableList: process.env.NUXT_GBP_DISABLE_LIST === "1",
    },

    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    },

    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
  },

  appConfig: {
    brand: { logoUrl: "/img/logo/logo.svg" },
  },

  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "vue-sonner/nuxt",
    "shadcn-nuxt",
  ],

  css: ["@/assets/styles/main.scss"],

  shadcn: {
    prefix: "",
    componentDir: "components/ui",
  },

  app: {
    head: {
      htmlAttrs: { lang: "es" },
      titleTemplate: "%s · Reprodisseny",
      title: "Impresión profesional en Cataluña",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Impresión profesional en Cataluña: gran formato, PLV, vinilos, calendarios y más, con asesoramiento experto.",
        },
        { property: "og:site_name", content: "Reprodisseny" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${siteUrl}/img/logo/logo.svg` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${siteUrl}/img/logo/logo.svg` },
        { name: "theme-color", content: "#111827" },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/img/logo/logo.svg" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/img/logo/favicon-32x32.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/img/logo/apple-touch-icon.png",
        },
      ],
    },
    pageTransition: { name: "fade", mode: "out-in" },
    layoutTransition: { name: "slide", mode: "out-in" },
  },

  tailwindcss: { configPath: "tailwind.config.js", exposeConfig: true },
  colorMode: { preference: "light", fallback: "light", classSuffix: "" },

  routeRules: {
    // Yo bajaría estos TTL para CMS:
    "/categorias/**": { isr: 600 },       // 10 min
    "/api/categorias/**": { swr: 300 },   // 5 min

    // Si tienes fichas de producto:
    "/productos/**": { isr: 600 },
    "/api/productos/**": { swr: 300 },

    "/img/logo.svg": { redirect: { to: "/img/logo/logo.svg", statusCode: 301 } },
  },

  compatibilityDate: "2025-06-01",
  devtools: { enabled: true },
})
