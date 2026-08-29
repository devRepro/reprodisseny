export function useCookieConsent() {
  const { $cookieConsent } = useNuxtApp();

  return {
    openCookiePreferences: () => $cookieConsent.showPreferences(),
  };
}
