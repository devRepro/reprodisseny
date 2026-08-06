import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_ORIGIN,
  resolveCanonicalHostRedirect,
} from "../shared/seo/canonicalHostRedirect";

test("redirects the Vercel production root to the canonical origin", () => {
  assert.equal(
    resolveCanonicalHostRedirect(new URL("https://reprodisseny.vercel.app/")),
    `${CANONICAL_ORIGIN}/`,
  );
});

test("preserves pathname and query string", () => {
  assert.equal(
    resolveCanonicalHostRedirect(
      new URL(
        "https://reprodisseny.vercel.app/productos/flyers-personalizados?utm_source=test",
      ),
    ),
    `${CANONICAL_ORIGIN}/productos/flyers-personalizados?utm_source=test`,
  );
});

test("does not redirect the canonical, local, or Vercel preview hosts", () => {
  const nonRedirectedUrls = [
    "https://reprodisseny.com/",
    "http://localhost:3000/",
    "https://reprodisseny-git-feature-example.vercel.app/",
  ];

  for (const url of nonRedirectedUrls) {
    assert.equal(resolveCanonicalHostRedirect(new URL(url)), null, url);
  }
});

test("the redirect destination cannot loop back through the host rule", () => {
  const destination = resolveCanonicalHostRedirect(
    new URL("https://reprodisseny.vercel.app/?utm_source=test"),
  );

  assert.ok(destination);
  assert.equal(resolveCanonicalHostRedirect(new URL(destination)), null);
});
