import type * as CookieConsent from "vanilla-cookieconsent";

export const COOKIE_CONSENT_COOKIE_NAME = "repro_cookie_consent";
export const COOKIE_CONSENT_REVISION = 1;
export const COOKIE_CONSENT_EXPIRY_DAYS = 182;

type CookieConsentConfigOptions = {
  onConsentChange: () => void;
};

const cookieTableHeadersEs = {
  name: "Cookie",
  provider: "Proveedor",
  purpose: "Finalidad",
  duration: "Duración",
};

const cookieTableHeadersCa = {
  name: "Cookie",
  provider: "Proveïdor",
  purpose: "Finalitat",
  duration: "Durada",
};

export function createCookieConsentConfig({
  onConsentChange,
}: CookieConsentConfigOptions): CookieConsent.CookieConsentConfig {
  return {
    mode: "opt-in",
    revision: COOKIE_CONSENT_REVISION,
    manageScriptTags: false,
    autoClearCookies: true,
    disablePageInteraction: false,
    hideFromBots: true,
    lazyHtmlGeneration: true,

    cookie: {
      name: COOKIE_CONSENT_COOKIE_NAME,
      path: "/",
      sameSite: "Lax",
      secure: true,
      expiresAfterDays: COOKIE_CONSENT_EXPIRY_DAYS,
      useLocalStorage: false,
    },

    guiOptions: {
      consentModal: {
        layout: "cloud inline",
        position: "bottom center",
        equalWeightButtons: true,
      },
      preferencesModal: {
        layout: "box",
        equalWeightButtons: true,
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        autoClear: {
          cookies: [{ name: /^_ga/ }, { name: "_gid" }],
          reloadPage: false,
        },
      },
      marketing: {
        autoClear: {
          cookies: [{ name: /^_gcl_/ }, { name: /^_gac_/ }],
          reloadPage: false,
        },
      },
    },

    onConsent: onConsentChange,
    onChange: onConsentChange,

    language: {
      default: "es",
      autoDetect: "document",
      translations: {
        es: {
          consentModal: {
            label: "Preferencias de cookies",
            title: "Tu privacidad, tu elección",
            description:
              "Usamos cookies necesarias para que la web funcione y, con tu permiso, cookies de analítica y marketing para medir el uso y las campañas.",
            acceptAllBtn: "Aceptar todas",
            acceptNecessaryBtn: "Rechazar todas",
            showPreferencesBtn: "Configurar",
            footer: '<a href="/politica-cookies">Política de cookies</a>',
          },
          preferencesModal: {
            title: "Preferencias de cookies",
            acceptAllBtn: "Aceptar todas",
            acceptNecessaryBtn: "Rechazar todas",
            savePreferencesBtn: "Guardar preferencias",
            closeIconLabel: "Cerrar preferencias",
            sections: [
              {
                title: "Elige cómo usamos las cookies",
                description:
                  "Puedes aceptar o rechazar cada finalidad opcional. Las cookies necesarias permanecen activas para guardar esta elección y mantener la seguridad.",
              },
              {
                title: "Necesarias",
                description:
                  "Permiten guardar tus preferencias de consentimiento y prestar funciones básicas y seguras.",
                linkedCategory: "necessary",
                cookieTable: {
                  headers: cookieTableHeadersEs,
                  body: [
                    {
                      name: COOKIE_CONSENT_COOKIE_NAME,
                      provider: "Repro Disseny",
                      purpose: "Guardar las categorías aceptadas.",
                      duration: `${COOKIE_CONSENT_EXPIRY_DAYS} días`,
                    },
                  ],
                },
              },
              {
                title: "Analítica",
                description:
                  "Ayuda a conocer de forma agregada cómo se usa la web y a mejorar su rendimiento.",
                linkedCategory: "analytics",
                cookieTable: {
                  headers: cookieTableHeadersEs,
                  body: [
                    {
                      name: "_ga, _ga_*, _gid",
                      provider: "Google Analytics",
                      purpose: "Medición de visitas e interacciones.",
                      duration: "Según la configuración de Google Analytics.",
                    },
                  ],
                },
              },
              {
                title: "Marketing",
                description:
                  "Permite medir campañas y conversiones publicitarias y, cuando corresponda, personalizar anuncios.",
                linkedCategory: "marketing",
                cookieTable: {
                  headers: cookieTableHeadersEs,
                  body: [
                    {
                      name: "_gcl_*, _gac_*",
                      provider: "Google Ads",
                      purpose: "Atribución y medición de campañas y conversiones.",
                      duration: "Según la configuración de Google Ads.",
                    },
                  ],
                },
              },
            ],
          },
        },
        ca: {
          consentModal: {
            label: "Preferències de cookies",
            title: "La teva privacitat, la teva elecció",
            description:
              "Utilitzem cookies necessàries perquè el web funcioni i, amb el teu permís, cookies d’analítica i màrqueting per mesurar-ne l’ús i les campanyes.",
            acceptAllBtn: "Acceptar-les totes",
            acceptNecessaryBtn: "Rebutjar-les totes",
            showPreferencesBtn: "Configurar",
            footer: '<a href="/politica-cookies">Política de cookies</a>',
          },
          preferencesModal: {
            title: "Preferències de cookies",
            acceptAllBtn: "Acceptar-les totes",
            acceptNecessaryBtn: "Rebutjar-les totes",
            savePreferencesBtn: "Desar preferències",
            closeIconLabel: "Tancar preferències",
            sections: [
              {
                title: "Tria com utilitzem les cookies",
                description:
                  "Pots acceptar o rebutjar cada finalitat opcional. Les cookies necessàries romanen actives per desar aquesta elecció i mantenir la seguretat.",
              },
              {
                title: "Necessàries",
                description:
                  "Permeten desar les preferències de consentiment i prestar funcions bàsiques i segures.",
                linkedCategory: "necessary",
                cookieTable: {
                  headers: cookieTableHeadersCa,
                  body: [
                    {
                      name: COOKIE_CONSENT_COOKIE_NAME,
                      provider: "Repro Disseny",
                      purpose: "Desar les categories acceptades.",
                      duration: `${COOKIE_CONSENT_EXPIRY_DAYS} dies`,
                    },
                  ],
                },
              },
              {
                title: "Analítica",
                description:
                  "Ajuda a conèixer de manera agregada com s’utilitza el web i a millorar-ne el rendiment.",
                linkedCategory: "analytics",
                cookieTable: {
                  headers: cookieTableHeadersCa,
                  body: [
                    {
                      name: "_ga, _ga_*, _gid",
                      provider: "Google Analytics",
                      purpose: "Mesurament de visites i interaccions.",
                      duration: "Segons la configuració de Google Analytics.",
                    },
                  ],
                },
              },
              {
                title: "Màrqueting",
                description:
                  "Permet mesurar campanyes i conversions publicitàries i, quan correspongui, personalitzar anuncis.",
                linkedCategory: "marketing",
                cookieTable: {
                  headers: cookieTableHeadersCa,
                  body: [
                    {
                      name: "_gcl_*, _gac_*",
                      provider: "Google Ads",
                      purpose: "Atribució i mesurament de campanyes i conversions.",
                      duration: "Segons la configuració de Google Ads.",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
}

export function resolveCookieConsentLanguage(language: string | null | undefined) {
  return language?.trim().toLowerCase().startsWith("ca") ? "ca" : "es";
}

export function createCookieConsentInitializer(
  run: (config: CookieConsent.CookieConsentConfig) => Promise<void>,
) {
  let initialization: Promise<void> | undefined;

  return (config: CookieConsent.CookieConsentConfig) => {
    initialization ||= run(config);
    return initialization;
  };
}
