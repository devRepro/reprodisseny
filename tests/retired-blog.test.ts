import assert from "node:assert/strict";
import test from "node:test";

import { createApp, eventHandler, toWebHandler } from "h3";

import legacyRedirectMiddleware from "../server/middleware/legacy-notfound-redirect";

async function requestBlog(path: string) {
  const app = createApp();
  app.use(eventHandler(legacyRedirectMiddleware));

  return toWebHandler(app)(
    new Request(`https://blog.reprodisseny.com${path}`, {
      headers: {
        "x-forwarded-host": "blog.reprodisseny.com",
        "x-forwarded-proto": "https",
      },
    }),
  );
}

test("el blog cancelado devuelve 410 indexable por el crawler, sin redirección genérica", async () => {
  for (const path of ["/", "/entrada-antigua", "/sitemap.xml"]) {
    const response = await requestBlog(path);

    assert.equal(response.status, 410, path);
    assert.equal(response.headers.get("location"), null, path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, follow", path);
  }
});

test("robots del blog permite rastrear las respuestas 410 y no anuncia sitemap", async () => {
  const response = await requestBlog("/robots.txt");
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^text\/plain/);
  assert.match(body, /User-agent: \*/);
  assert.match(body, /Allow: \//);
  assert.doesNotMatch(body, /Disallow|Sitemap/i);
});

test("una URL antigua con sustituto conserva un único 301 al destino comercial", async () => {
  const response = await requestBlog("/manual-para-hacer-un-buen-flyer");

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://reprodisseny.com/como-preparar-archivos",
  );
});
