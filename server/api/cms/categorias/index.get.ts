import { defineEventHandler } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

export default defineEventHandler(async () => {
  const { categories } = await getCmsCatalog();
  return (categories || []).filter((c: any) => c?.isPublished !== false && c?.hidden !== true);
});

