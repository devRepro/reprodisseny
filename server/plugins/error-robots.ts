import {
  getResponseStatus,
  setResponseHeader,
} from "h3";

const ERROR_ROBOTS_DIRECTIVE = "noindex, follow";

export default defineNitroPlugin((nitroApp) => {
  // Covers errors returned directly by server handlers, including JSON APIs.
  nitroApp.hooks.hook("beforeResponse", (event) => {
    const status = getResponseStatus(event);

    if (status === 404 || status === 410) {
      setResponseHeader(event, "X-Robots-Tag", ERROR_ROBOTS_DIRECTIVE);
    }
  });

  // Nitro assigns rendered HTML error statuses after `beforeResponse`.
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const status = response.statusCode || getResponseStatus(event);

    if (status === 404 || status === 410) {
      response.headers = {
        ...response.headers,
        "X-Robots-Tag": ERROR_ROBOTS_DIRECTIVE,
      };
      setResponseHeader(event, "X-Robots-Tag", ERROR_ROBOTS_DIRECTIVE);
    }
  });

  nitroApp.hooks.hook("error", (error, { event }) => {
    const status = "statusCode" in error ? error.statusCode : undefined;

    if (event && (status === 404 || status === 410)) {
      setResponseHeader(event, "X-Robots-Tag", ERROR_ROBOTS_DIRECTIVE);
    }
  });
});
