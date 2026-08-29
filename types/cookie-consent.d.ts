type CookieConsentApi = {
  showPreferences: () => void;
};

declare module "#app" {
  interface NuxtApp {
    $cookieConsent: CookieConsentApi;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $cookieConsent: CookieConsentApi;
  }
}

export {};
