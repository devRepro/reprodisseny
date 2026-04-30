import { getQuery } from "h3";
import { getHomeCategories } from "~/server/services/cms/catalog.service";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const limit = Number(query.limit ?? 8);

  return {
    items: getHomeCategories(limit),
  };
});