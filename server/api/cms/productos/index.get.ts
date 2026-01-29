import { defineEventHandler } from "h3";
import { getCmsCatalog } from "~/server/utils/cmsCatalog.server";

export default defineEventHandler(async () => {
  const { products } = await getCmsCatalog();
  return (products || []).filter((p: any) => p?.isPublished !== false && p?.hidden !== true);
});

