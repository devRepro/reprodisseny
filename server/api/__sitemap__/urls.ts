// server/api/__sitemap__/urls.ts
import { defineSitemapEventHandler } from "#imports";
import routes from "~/cms/routes.json";

export default defineSitemapEventHandler(() => {
  const now = new Date().toISOString();

  return (routes as string[])
    .filter((path) => typeof path === "string")
    .filter((path) => path.startsWith("/"))
    .filter((path) => !path.startsWith("/api"))
    .filter((path) => !path.startsWith("/admin"))
    .filter((path) => !path.startsWith("/panel"))
    .filter((path) => path !== "/gracias")
    .map((path) => ({
      loc: path,
      lastmod: now,
    }));
});