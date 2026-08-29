export type GoogleConsentValue = "granted" | "denied";

export type GoogleConsentState = {
  ad_storage: GoogleConsentValue;
  ad_user_data: GoogleConsentValue;
  ad_personalization: GoogleConsentValue;
  analytics_storage: GoogleConsentValue;
  functionality_storage: GoogleConsentValue;
  personalization_storage: GoogleConsentValue;
  security_storage: GoogleConsentValue;
};

export type CookieConsentSelection = {
  analytics: boolean;
  marketing: boolean;
};

export const GOOGLE_CONSENT_WAIT_FOR_UPDATE_MS = 2000;

export const GOOGLE_CONSENT_DEFAULT: Readonly<GoogleConsentState> = Object.freeze({
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
});

export function mapCookieConsentToGoogleConsent(
  selection: CookieConsentSelection,
): GoogleConsentState {
  const analytics = selection.analytics ? "granted" : "denied";
  const marketing = selection.marketing ? "granted" : "denied";

  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analytics,
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
  };
}

export function createGoogleConsentDefaultScript() {
  const defaultState = JSON.stringify({
    ...GOOGLE_CONSENT_DEFAULT,
    wait_for_update: GOOGLE_CONSENT_WAIT_FOR_UPDATE_MS,
  });

  return `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', ${defaultState});`;
}

export type GoogleConsentDispatcher = (state: GoogleConsentState) => boolean | void;

export function createGoogleConsentUpdater(dispatch: GoogleConsentDispatcher) {
  let lastState = "";

  return (selection: CookieConsentSelection) => {
    const state = mapCookieConsentToGoogleConsent(selection);
    const serializedState = JSON.stringify(state);

    if (serializedState === lastState) return false;
    if (dispatch(state) === false) return false;

    lastState = serializedState;
    return true;
  };
}

type GoogleTagTarget = {
  gtag?: (
    command: "consent",
    action: "update",
    state: GoogleConsentState,
  ) => void;
};

export function dispatchGoogleConsentUpdate(
  state: GoogleConsentState,
  target: GoogleTagTarget = window,
) {
  if (typeof target.gtag !== "function") return false;

  target.gtag("consent", "update", state);
  return true;
}
