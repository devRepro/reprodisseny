import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

const chromeCandidates = process.platform === "win32"
  ? [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ]
  : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];

const browserPath = chromeCandidates.find((candidate) => existsSync(candidate));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopProcess(child: ChildProcessWithoutNullStreams | null) {
  if (!child?.pid || child.killed) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

async function waitForCategoryPage(port: number, logs: string[]) {
  const url = `http://127.0.0.1:${port}/categorias/expositores`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < 150_000) {
    try {
      const response = await fetch(url);
      const html = await response.text();

      if (response.status === 200 && html.includes("category-content-tabs")) {
        return url;
      }
    } catch {
      // Nuxt is still starting.
    }

    await delay(500);
  }

  throw new Error(`Nuxt dev server did not expose category tabs.\n${logs.slice(-20).join("\n")}`);
}

function requestJson<T>(port: number, method: "GET" | "PUT", path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path, method }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

type CdpTarget = {
  webSocketDebuggerUrl: string;
};

type TabState = {
  selected: string;
  tabs: Array<{
    text: string;
    selected: string | null;
    tabIndex: string | null;
    controls: string | null;
  }>;
  panelText: string;
  visiblePanels: string[];
};

async function waitForCdp(port: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 20_000) {
    try {
      await requestJson(port, "GET", "/json/version");
      return;
    } catch {
      await delay(250);
    }
  }

  throw new Error("Chrome DevTools Protocol did not start.");
}

test(
  "category detail tabs switch the active tab and visible panel",
  { skip: !browserPath, timeout: 240_000 },
  async () => {
    assert.ok(browserPath, "Chrome or Edge is required for this interaction test");

    const nuxtPort = 3137;
    const cdpPort = 9337;
    const logs: string[] = [];
    const nuxt = spawn(
      process.execPath,
      [join(repoRoot, "node_modules", "nuxt", "bin", "nuxt.mjs"), "dev", "--host", "127.0.0.1", "--port", String(nuxtPort)],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          NUXT_IGNORE_LOCK: "1",
          NUXT_TELEMETRY_DISABLED: "1",
        },
      },
    );

    nuxt.stdout.on("data", (chunk) => logs.push(String(chunk).trim()));
    nuxt.stderr.on("data", (chunk) => logs.push(String(chunk).trim()));

    let chrome: ChildProcessWithoutNullStreams | null = null;
    const userDataDir = mkdtempSync(join(tmpdir(), "rd-tabs-e2e-"));

    try {
      const url = await waitForCategoryPage(nuxtPort, logs);
      chrome = spawn(browserPath, [
        "--headless=new",
        "--disable-gpu",
        "--disable-extensions",
        "--no-first-run",
        "--no-default-browser-check",
        `--remote-debugging-port=${cdpPort}`,
        `--user-data-dir=${userDataDir}`,
        "about:blank",
      ]);

      await waitForCdp(cdpPort);
      const target = await requestJson<CdpTarget>(
        cdpPort,
        "PUT",
        `/json/new?about:blank`,
      );
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      let id = 0;
      const pending = new Map<number, (value: any) => void>();

      ws.onmessage = (event) => {
        const message = JSON.parse(String(event.data));
        if (message.id && pending.has(message.id)) {
          pending.get(message.id)?.(message);
          pending.delete(message.id);
        }
      };

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = () => reject(new Error("Chrome websocket failed"));
      });

      const send = (method: string, params: Record<string, unknown> = {}) =>
        new Promise<any>((resolve, reject) => {
          const callId = ++id;
          const timeout = setTimeout(() => {
            pending.delete(callId);
            reject(new Error(`CDP command timed out: ${method}`));
          }, 10_000);
          pending.set(callId, (value) => {
            clearTimeout(timeout);
            resolve(value);
          });
          ws.send(JSON.stringify({ id: callId, method, params }));
        });

      const evaluate = async <T>(expression: string): Promise<T> => {
        const result = await send("Runtime.evaluate", {
          expression,
          awaitPromise: true,
          returnByValue: true,
        });

        if (result.result?.exceptionDetails) {
          throw new Error(
            result.result.exceptionDetails.exception?.description ||
              result.result.exceptionDetails.text,
          );
        }

        return result.result.result.value as T;
      };

      await send("Page.enable");
      await send("Runtime.enable");
      await send("Page.navigate", { url });

      const readyAt = Date.now();
      let ready = false;
      while (Date.now() - readyAt < 90_000) {
        ready = await evaluate<boolean>(`location.pathname === '/categorias/expositores' && document.readyState === 'complete'
          && document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false
          && document.querySelectorAll('.category-content-tabs [role=tab]').length === 4`);
        if (ready) break;
        await delay(250);
      }
      assert.equal(ready, true, "Nuxt must hydrate the category tabs before interaction");

      const state = () => evaluate<TabState>(`(() => {
        const tabs = [...document.querySelectorAll('.category-content-tabs [role=tab]')].map((tab) => ({
          text: tab.textContent.trim(),
          selected: tab.getAttribute('aria-selected'),
          tabIndex: tab.getAttribute('tabindex'),
          controls: tab.getAttribute('aria-controls'),
        }));
        const selected = tabs.find((tab) => tab.selected === 'true');
        const panel = selected ? document.getElementById(selected.controls) : null;

        return {
          selected: selected?.text || '',
          tabs,
          panelText: panel?.innerText || '',
          visiblePanels: [...document.querySelectorAll('.category-content-tabs [role=tabpanel]')]
            .filter((panel) => getComputedStyle(panel).display !== 'none')
            .map((panel) => panel.id),
        };
      })()`);

      const clickTab = async (label: string) => {
        const clicked = await evaluate<boolean>(`(() => {
          const tab = [...document.querySelectorAll('.category-content-tabs [role=tab]')]
            .find((item) => item.textContent.trim() === ${JSON.stringify(label)});
          if (!tab) return false;
          tab.click();
          return true;
        })()`);

        assert.equal(clicked, true, `${label} tab should exist`);
        const changedAt = Date.now();
        while (Date.now() - changedAt < 10_000) {
          const current = await state();
          if (current.selected === label && current.visiblePanels.length === 1 &&
            current.visiblePanels[0] === current.tabs.find((tab) => tab.text === label)?.controls) {
            return current;
          }
          await delay(100);
        }
        throw new Error(`Tab ${label} did not select and show its panel: ${JSON.stringify(await state())}`);
      };

      const initial = await state();
      assert.equal(initial.selected, "Detalles");
      assert.deepEqual(initial.visiblePanels, ["tabpanel-details"]);
      assert.ok(initial.panelText.length > 40);

      const types = await clickTab("Tipos");
      assert.equal(types.selected, "Tipos");
      assert.equal(types.tabs.find((tab) => tab.text === "Tipos")?.selected, "true");
      assert.equal(types.tabs.find((tab) => tab.text === "Tipos")?.tabIndex, "0");
      assert.equal(types.tabs.find((tab) => tab.text === "Detalles")?.selected, "false");
      assert.deepEqual(types.visiblePanels, ["tabpanel-types"]);
      assert.notEqual(types.panelText, initial.panelText);

      const formats = await clickTab("Formatos");
      assert.equal(formats.selected, "Formatos");
      assert.equal(formats.tabs.find((tab) => tab.text === "Formatos")?.selected, "true");
      assert.equal(formats.tabs.find((tab) => tab.text === "Tipos")?.selected, "false");
      assert.deepEqual(formats.visiblePanels, ["tabpanel-formats"]);
      assert.notEqual(formats.panelText, types.panelText);

      await evaluate(`(() => {
        const active = document.querySelector('.category-content-tabs [role=tab][aria-selected="true"]');
        active?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      })()`);
      let endState = await state();
      for (let attempt = 0; attempt < 100 && endState.selected !== "Acabados"; attempt++) {
        await delay(100);
        endState = await state();
      }
      assert.equal(endState.selected, "Acabados");
      assert.deepEqual(endState.visiblePanels, ["tabpanel-finishes"]);

      await evaluate(`(() => {
        const active = document.querySelector('.category-content-tabs [role=tab][aria-selected="true"]');
        active?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      })()`);
      let homeState = await state();
      for (let attempt = 0; attempt < 100 && homeState.selected !== "Detalles"; attempt++) {
        await delay(100);
        homeState = await state();
      }
      assert.equal(homeState.selected, "Detalles");
      assert.deepEqual(homeState.visiblePanels, ["tabpanel-details"]);

      ws.close();
    } finally {
      stopProcess(chrome);
      stopProcess(nuxt);
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {
        // Chrome can keep crashpad files locked briefly on Windows.
      }
    }
  },
);