// server/api/cms/ping.get.ts
export default defineEventHandler(() => {
    return {
      ok: true,
      route: "/api/cms/ping",
      ts: new Date().toISOString(),
    };
  });