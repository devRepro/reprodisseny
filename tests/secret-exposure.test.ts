import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("el árbol versionado no contiene credenciales con formato SendGrid", () => {
  const credentialPattern = [
    "S",
    "G",
    "\\.",
    "[A-Za-z0-9_-]{10,}",
    "\\.",
    "[A-Za-z0-9_-]{10,}",
  ].join("");
  const scan = spawnSync(
    "git",
    [
      "grep",
      "-I",
      "-l",
      "-E",
      credentialPattern,
      "--",
      ".",
      ":(exclude)tests/secret-exposure.test.ts",
    ],
    { encoding: "utf8" },
  );

  assert.ok(
    scan.status === 0 || scan.status === 1,
    scan.stderr || `git grep terminó con código ${scan.status}`,
  );
  assert.deepEqual(
    scan.stdout.trim().split("\n").filter(Boolean),
    [],
    "Se detectó una posible credencial; sólo se muestran las rutas afectadas.",
  );
});
