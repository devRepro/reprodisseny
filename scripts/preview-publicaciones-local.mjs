// Local preview of the existing Nitro output. Never used by the production build.
process.env.NITRO_HOST = '127.0.0.1';
process.env.NITRO_PORT ||= '3100';
if (process.platform === 'win32') {
  // Nitro 2.13.4 / @nuxt/icon uses a POSIX import-meta fallback in node-server output.
  globalThis._importMeta_ ||= {url: new URL('../.output/server/index.mjs', import.meta.url).href, env: process.env};
}
// Resolve at runtime so TypeScript never imports generated server globals as source.
const outputUrl = new URL('../.output/server/index.mjs', import.meta.url);
await import(outputUrl.href);
