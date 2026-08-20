import {
  getRequestURL,
  getResponseStatus,
  setResponseHeader,
} from "h3";
import { hasOnlyCatalogPaginationQuery } from "~/utils/seo/catalogUrls";

const ERROR_ROBOTS_DIRECTIVE = "noindex, follow";

function getCatalogQueryRobotsDirective(event: Parameters<typeof getRequestURL>[0]) {
  const url = getRequestURL(event);
  const isProductsIndex = url.pathname === "/productos";
  const isCategoryPage = url.pathname.startsWith("/categorias/");

  if (!isProductsIndex && !isCategoryPage) return null;

  const query = Object.fromEntries(url.searchParams.entries());

  return hasOnlyCatalogPaginationQuery(query)
    ? null
    : ERROR_ROBOTS_DIRECTIVE;
}

function resolveRobotsDirective(
  event: Parameters<typeof getRequestURL>[0],
  status: number,
) {
  if (status === 404 || status === 410) {
    return ERROR_ROBOTS_DIRECTIVE;
  }

  return getCatalogQueryRobotsDirective(event);
}

export default defineNitroPlugin((nitroApp) => {
  // Covers errors returned directly by server handlers, including JSON APIs.
  nitroApp.hooks.hook("beforeResponse", (event) => {
    const status = getResponseStatus(event);
    const robots = resolveRobotsDirective(event, status);

    if (robots) {
      setResponseHeader(event, "X-Robots-Tag", robots);
    }
  });

  // Nitro assigns rendered HTML error statuses after `beforeResponse`.
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const status = response.statusCode || getResponseStatus(event);
    const robots = resolveRobotsDirective(event, status);

    if (robots) {
      response.headers = {
        ...response.headers,
        "X-Robots-Tag": robots,
      };
      setResponseHeader(event, "X-Robots-Tag", robots);
    }
  });

  nitroApp.hooks.hook("error", (error, { event }) => {
    const status = "statusCode" in error ? error.statusCode : undefined;

    if (event && (status === 404 || status === 410)) {
      setResponseHeader(event, "X-Robots-Tag", ERROR_ROBOTS_DIRECTIVE);
    }
  });
});
