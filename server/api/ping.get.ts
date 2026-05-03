/ server/api/ping.get.ts
export default defineEventHandler(() => {
  return {
    ok: true,
    route: "/api/ping",
    ts: new Date().toISOString(),
  };
});