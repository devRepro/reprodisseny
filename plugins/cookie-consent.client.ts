import * as CookieConsent from "vanilla-cookieconsent";

import {
  createCookieConsentConfig,
  createCookieConsentInitializer,
  resolveCookieConsentLanguage,
} from "~/config/cookieConsent";
import {
  createGoogleConsentUpdater,
  dispatchGoogleConsentUpdate,
} from "~/utils/googleConsent";

const initializeCookieConsent = createCookieConsentInitializer(CookieConsent.run);

export default defineNuxtPlugin(async () => {
  const updateGoogleConsent = createGoogleConsentUpdater((state) =>
    dispatchGoogleConsentUpdate(state),
  );

  const syncGoogleConsent = () =>
    updateGoogleConsent({
      analytics: CookieConsent.acceptedCategory("analytics"),
      marketing: CookieConsent.acceptedCategory("marketing"),
    });

  await initializeCookieConsent(
    createCookieConsentConfig({ onConsentChange: syncGoogleConsent }),
  );

  const languageObserver = new MutationObserver(() => {
    void CookieConsent.setLanguage(
      resolveCookieConsentLanguage(document.documentElement.lang),
    );
  });
  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  return {
    provide: {
      cookieConsent: {
        showPreferences: () => CookieConsent.showPreferences(),
      },
    },
  };
});
