import assert from "node:assert/strict";
import test from "node:test";

import { optimizeGoogleAvatarUrl } from "../utils/googleAvatar";

const S128_SUFFIXED =
  "https://lh3.googleusercontent.com/a-/ACN8uLsPq1234567890=s128-c0x00000000-cc-rp-mo";
const S64_SUFFIXED =
  "https://lh3.googleusercontent.com/a-/ACN8uLsPq1234567890=s64-c0x00000000-cc-rp-mo";

test("optimizeGoogleAvatarUrl: converts s128 -> s64", () => {
  assert.equal(
    optimizeGoogleAvatarUrl(S128_SUFFIXED, 64),
    S64_SUFFIXED,
  );
});

test("optimizeGoogleAvatarUrl: s64 stays s64 (idempotent)", () => {
  assert.equal(
    optimizeGoogleAvatarUrl(S64_SUFFIXED, 64),
    S64_SUFFIXED,
  );
});

test("optimizeGoogleAvatarUrl: preserves suffixes", () => {
  const result = optimizeGoogleAvatarUrl(
    "https://lh3.googleusercontent.com/a/xyz=s128-c0x00000000-cc-rp-mo-ba2",
    64,
  );
  assert.equal(
    result,
    "https://lh3.googleusercontent.com/a/xyz=s64-c0x00000000-cc-rp-mo-ba2",
  );
});

test("optimizeGoogleAvatarUrl: non-Google URL is untouched", () => {
  const url = "https://webcms.blob.core.windows.net/media/home/impresion.webp";
  assert.equal(optimizeGoogleAvatarUrl(url, 64), url);
});

test("optimizeGoogleAvatarUrl: null is safe", () => {
  assert.equal(optimizeGoogleAvatarUrl(null, 64), null);
});

test("optimizeGoogleAvatarUrl: undefined is safe", () => {
  assert.equal(optimizeGoogleAvatarUrl(undefined, 64), undefined);
});

test("optimizeGoogleAvatarUrl: empty string is safe", () => {
  assert.equal(optimizeGoogleAvatarUrl("", 64), "");
});

test("optimizeGoogleAvatarUrl: unexpected URL does not throw", () => {
  const bad = "not a url at all !!! 128";
  assert.equal(optimizeGoogleAvatarUrl(bad, 64), bad);

  const malformed = "https://lh3.googleusercontent.com/path=s128-c0x00000000::bad";
  assert.doesNotThrow(() => optimizeGoogleAvatarUrl(malformed, 64));
});

test("optimizeGoogleAvatarUrl: only compatible googleusercontent is modified", () => {
  const notPhotos = "https://evil-googleusercontent.com/a=s128-c0x";
  assert.equal(optimizeGoogleAvatarUrl(notPhotos, 64), notPhotos);

  const protocolRelative =
    "//lh3.googleusercontent.com/a/x=s128-c0x00000000-cc-rp-mo";
  assert.equal(
    optimizeGoogleAvatarUrl(protocolRelative, 64),
    "//lh3.googleusercontent.com/a/x=s64-c0x00000000-cc-rp-mo",
  );
});
