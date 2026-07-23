import {
  defineEventHandler,
  getRequestURL,
  setResponseHeader,
} from "h3";

const NOINDEX_NOFOLLOW_PATHS = new Set([
  "/promo-test",
]);

function isSearchPath(pathname: string) {
  return pathname === "/buscar" || pathname.startsWith("/buscar/");
}

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event);

  if (NOINDEX_NOFOLLOW_PATHS.has(pathname)) {
    setResponseHeader(event, "X-Robots-Tag", "noindex, nofollow");
    return;
  }

  if (isSearchPath(pathname)) {
    setResponseHeader(event, "X-Robots-Tag", "noindex, follow");
  }
});
