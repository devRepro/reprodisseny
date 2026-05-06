// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://reprodisseny.com";

const siteEnv =
  process.env.NUXT_SITE_ENV ||
  process.env.VERCEL_ENV ||
  process.env.NODE_ENV;

const isIndexable = siteEnv === "production";

const usercentricsSettingsId =
  process.env.NUXT_PUBLIC_USERCENTRICS_SETTINGS_ID || "";

const gtmId = process.env.NUXT_PUBLIC_GTM_ID || "";

const googleSiteVerification =
  process.env.NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";

export default defineNuxtConfig({
  experimental: {
    payloadExtraction: process.env.NODE_ENV === "production",
    appManifest: false,
  },

  site: {
    url: siteUrl,
    name: "Repro Disseny",
    description:
      "Impresión profesional en Cataluña: gran formato, PLV, vinilos, calendarios, packaging y material corporativo con asesoramiento experto.",
    defaultLocale: "es",
    trailingSlash: false,
    indexable: isIndexable,
  },

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
    exclude: [
      "/admin",
      "/admin/**",
      "/api",
      "/api/**",
      "/panel",
      "/panel/**",
      "/gracias",
    ],
  },

  robots: {
    disallow: [
      "/admin",
      "/admin/",
      "/admin/**",
      "/api",
      "/api/",
      "/api/**",
      "/panel",
      "/panel/",
      "/panel/**",
      "/gracias",
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  },

  runtimeConfig: {
    mail: {
      provider: process.env.MAIL_PROVIDER,
      senderUpn: process.env.MAIL_SENDER_UPN,
      to: process.env.MAIL_TO,

      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "1",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },

    contact: {
      listId: process.env.SP_LIST_CONTACT_ID,
    },

    ms: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },

    sharepoint: {
      crm: {
        siteId: process.env.CRM_SITE_ID || process.env.GRAPH_SITE_ID || "",
        siteHostname:
          process.env.CRM_SITE_HOSTNAME ||
          process.env.SHAREPOINT_HOSTNAME ||
          "reprodisseny.sharepoint.com",
        sitePath:
          process.env.CRM_SITE_PATH ||
          process.env.SHAREPOINT_SITE_PATH ||
          "/sites/portal",

        listId:
          process.env.CRM_PRICE_REQUESTS_LIST_ID ||
          process.env.PRICE_REQUESTS_LIST_ID ||
          "",

        commentsListId:
          process.env.CRM_PRICE_REQUESTS_COMMENTS_LIST_ID ||
          process.env.GRAPH_PRICE_REQUESTS_COMMENTS_LIST_ID ||
          "",

        attachments: {
          libraryListId:
            process.env.CRM_ATTACHMENTS_LIBRARY_LIST_ID ||
            process.env.SHAREPOINT_LIBRARY_LIST_ID ||
            "",

          libraryDriveId:
            process.env.CRM_ATTACHMENTS_LIBRARY_DRIVE_ID ||
            process.env.SHAREPOINT_LIBRARY_DRIVE_ID ||
            "",

          libraryName:
            process.env.CRM_ATTACHMENTS_LIBRARY_NAME || "AssetsProducts",

          baseFolder:
            process.env.CRM_ATTACHMENTS_BASE_FOLDER || "price-requests",

          maxFileBytes: Number(
            process.env.CRM_ATTACHMENTS_MAX_FILE_BYTES || 26214400,
          ),

          allowedMimeTypes: (
            process.env.CRM_ATTACHMENTS_ALLOWED_MIME_TYPES ||
            "application/pdf,image/jpeg,image/png,image/svg+xml,application/zip,application/postscript"
          )
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        },
      },

      cms: {
        siteId: process.env.CMS_SITE_ID || "",
        siteHostname:
          process.env.CMS_SITE_HOSTNAME || "reprodisseny.sharepoint.com",
        sitePath: process.env.CMS_SITE_PATH || "",

        listId:
          process.env.CMS_LIST_ID ||
          process.env.CMS_CATEGORIES_LIST_ID ||
          "",

        listDisplayName: process.env.CMS_LIST_DISPLAY_NAME || "",

        categoriesListId: process.env.CMS_CATEGORIES_LIST_ID || "",
        productsListId: process.env.CMS_PRODUCTS_LIST_ID || "",
        assetsListId: process.env.CMS_ASSETS_LIST_ID || "",
      },
    },

    crm: {
      emailField:
        process.env.CRM_PR_EMAIL_FIELD ||
        process.env.PR_EMAIL_FIELD ||
        "Email",

      productField:
        process.env.CRM_PR_PRODUCT_FIELD ||
        process.env.PR_PRODUCT_FIELD ||
        "Producto",

      commentsField:
        process.env.CRM_PR_COMMENTS_FIELD ||
        process.env.PR_COMMENTS_FIELD ||
        "Comentarios",

      dateField:
        process.env.CRM_PR_DATE_FIELD ||
        process.env.PR_DATE_FIELD ||
        "",

      phoneField:
        process.env.CRM_PR_PHONE_FIELD ||
        process.env.PR_PHONE_FIELD ||
        "",

      companyField:
        process.env.CRM_PR_COMPANY_FIELD ||
        process.env.PR_COMPANY_FIELD ||
        "",

      commentsListId:
        process.env.CRM_PRICE_REQUESTS_COMMENTS_LIST_ID ||
        process.env.GRAPH_PRICE_REQUESTS_COMMENTS_LIST_ID ||
        "",

      commentsParentIdField:
        process.env.CRM_PRC_PARENT_ID_FIELD ||
        process.env.PRC_PARENT_ID_FIELD ||
        "ParentId",

      commentsBodyField:
        process.env.CRM_PRC_BODY_FIELD ||
        process.env.PRC_BODY_FIELD ||
        "Body",

      commentsKindField:
        process.env.CRM_PRC_KIND_FIELD ||
        process.env.PRC_KIND_FIELD ||
        "Kind",

      commentsMetaField:
        process.env.CRM_PRC_META_FIELD ||
        process.env.PRC_META_FIELD ||
        "Meta",

      originField:
        process.env.CRM_PR_ORIGIN_FIELD ||
        process.env.PR_ORIGIN_FIELD ||
        "",

      utmField:
        process.env.CRM_PR_UTM_FIELD ||
        process.env.PR_UTM_FIELD ||
        "",

      quantityField:
        process.env.CRM_PR_QUANTITY_FIELD ||
        process.env.PR_QUANTITY_FIELD ||
        "",

      attributesField:
        process.env.CRM_PR_ATTRIBUTES_FIELD ||
        process.env.PR_ATTRIBUTES_FIELD ||
        "",

      requestKeyField: process.env.CRM_PR_REQUEST_KEY_FIELD || "RequestKey",

      hasAttachmentField:
        process.env.CRM_PR_HAS_ATTACHMENT_FIELD || "HasAttachment",

      primaryFileDriveItemIdField:
        process.env.CRM_PR_PRIMARY_FILE_DRIVE_ITEM_ID_FIELD ||
        "PrimaryFileDriveItemId",

      primaryFileWebUrlField:
        process.env.CRM_PR_PRIMARY_FILE_WEB_URL_FIELD || "PrimaryFileWebUrl",

      primaryFileNameField:
        process.env.CRM_PR_PRIMARY_FILE_NAME_FIELD || "PrimaryFileName",

      primaryFileMimeTypeField:
        process.env.CRM_PR_PRIMARY_FILE_MIME_TYPE_FIELD ||
        "PrimaryFileMimeType",

      primaryFileSizeField:
        process.env.CRM_PR_PRIMARY_FILE_SIZE_FIELD || "PrimaryFileSize",
    },

    googleMaps: {
      apiKey:
        process.env.NUXT_GOOGLE_MAPS_API_KEY ||
        process.env.GOOGLE_MAPS_API_KEY ||
        "",
    },

    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || siteUrl,
      siteUrl,
      mediaBaseUrl:
        process.env.NUXT_PUBLIC_MEDIA_BASE_URL ||
        "https://webcms.blob.core.windows.net/media",

      usercentricsSettingsId,
      gtmId,
      googleSiteVerification,

      googleMaps: {
        placeId:
          process.env.NUXT_PUBLIC_GOOGLE_MAPS_PLACE_ID ||
          process.env.GOOGLE_MAPS_PLACE_ID ||
          "",
      },
    },
  },

  appConfig: {
    brand: { logoUrl: "/img/logo/reprodisseny.svg" },
  },

  modules: [
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "vue-sonner/nuxt",
    "shadcn-nuxt",
  ],

  css: ["@/assets/styles/main.scss"],

  image: {
    provider: "ipx",
    domains: ["webcms.blob.core.windows.net"],
  },

  shadcn: {
    prefix: "",
    componentDir: "components/ui",
  },

  app: {
    head: {
      htmlAttrs: { lang: "es" },
      titleTemplate: "%s · Repro Disseny",
      title: "Impresión profesional en Cataluña",

      script: [
        {
          "data-usercentrics": "ignore",
          type: "text/javascript",
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_personalization: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', false);
          `,
        },

        ...(usercentricsSettingsId
          ? [
              {
                src: "https://web.cmp.usercentrics.eu/modules/autoblocker.js",
                type: "text/javascript",
              },
              {
                id: "usercentrics-cmp",
                src: "https://web.cmp.usercentrics.eu/ui/loader.js",
                "data-settings-id": usercentricsSettingsId,
                type: "text/javascript",
                async: true,
              },
            ]
          : []),

        ...(gtmId
          ? [
              {
                type: "text/javascript",
                innerHTML: `
                  (function(w,d,s,l,i){
                    w[l]=w[l]||[];
                    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                    var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                    j.async=true;
                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                    f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              },
            ]
          : []),
      ],

      noscript: [
        ...(gtmId
          ? [
              {
                tagPosition: "bodyOpen",
                innerHTML: `
                  <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
                    height="0"
                    width="0"
                    style="display:none;visibility:hidden"></iframe>
                `,
              },
            ]
          : []),
      ],

      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },

        ...(googleSiteVerification
          ? [
              {
                name: "google-site-verification",
                content: googleSiteVerification,
              },
            ]
          : []),

        {
          name: "description",
          content:
            "Impresión profesional en Cataluña: gran formato, PLV, vinilos, calendarios, packaging y material corporativo con asesoramiento experto.",
        },
        { property: "og:site_name", content: "Repro Disseny" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: `${siteUrl}/img/ui/reprodisseny-og.webp`,
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:image",
          content: `${siteUrl}/img/ui/reprodisseny-og.webp`,
        },
        { name: "theme-color", content: "#111827" },
        { name: "format-detection", content: "telephone=no" },
      ],

      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/img/logo/favicon-32x32.ico",
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

  tailwindcss: { configPath: "tailwind.config.ts", exposeConfig: true },

  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  routeRules: {
    "/categorias/**": { isr: 600 },
    "/productos/**": { isr: 600 },

    "/api/**": {
      robots: false,
    },

    "/admin": { robots: false },
    "/admin/**": { robots: false },
    "/panel": { robots: false },
    "/panel/**": { robots: false },
    "/gracias": { robots: false },

    "/img/logo.svg": {
      redirect: { to: "/img/logo/reprodisseny.svg", statusCode: 301 },
    },
  },

  nitro: {
    serverAssets: [
      {
        baseName: "cms",
        dir: "./cms",
      },
    ],

    prerender: {
      failOnError: false,
       routes: ["/robots.txt", "/sitemap.xml"],
    },
  },

  compatibilityDate: "2025-06-01",

  devtools: {
    enabled: false,
  },
});