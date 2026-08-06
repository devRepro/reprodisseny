import {
  defineEventHandler,
  getRequestURL,
  sendRedirect,
} from "h3";

import { resolveCanonicalHostRedirect } from "../../shared/seo/canonicalHostRedirect";

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event, { xForwardedHost: true });
  const destination = resolveCanonicalHostRedirect(requestUrl);

  if (destination) {
    return sendRedirect(event, destination, 308);
  }
});
