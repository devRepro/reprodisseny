// /server/api/gbp/locations.get.ts
import { getCookie, getHeader } from "h3";

export default cachedEventHandler(async (event) => {
  console.log("Fetching locations from Google API (not from cache)...");
  // (opcional de debug) ver si llega cookie
  // console.log("cookie header ->", getHeader(event, "cookie") || "(sin cookie)");

  const accessToken = getCookie(event, "gbp_access_token");
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: "No autenticado" });
  }

  try {
    // 1) Cuentas
    const accountsResponse: { accounts?: { name: string }[] } = await $fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const account = accountsResponse.accounts?.[0];
    if (!account?.name) return []; // <- siempre array

    // 2) Ubicaciones
    const locationsResponse: { locations?: { name: string; title?: string }[] } = await $fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const list = locationsResponse.locations ?? [];
    return list.map((loc) => ({
      id: loc.name,          // p.ej. "locations/1234567890"
      title: loc.title ?? "",
    }));
  } catch (err: any) {
    // Si Google limita, propaga 429
    if (err?.statusCode === 429) {
      throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
    }
    // Propaga el mensaje REAL de Google para depurar
    const status = err?.statusCode || 500;
    const message =
      err?.data?.error?.message ||
      err?.statusMessage ||
      "Error al contactar con la API de Google";
    console.error("Google API error (locations):", status, err?.data || err);
    throw createError({ statusCode: status, statusMessage: message });
  }
}, {
  name: "gbp_locations_cache",
  maxAge: 60 * 15,
  getKey: (event) => {
    const t = getCookie(event, "gbp_access_token");
    // No cachees si no hay token; si hay, usa un slice (no el token entero)
    return t ? `user_locations_${t.slice(0, 16)}` : undefined;
  },
});
