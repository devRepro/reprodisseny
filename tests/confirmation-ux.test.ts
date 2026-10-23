import assert from "node:assert/strict";
import test from "node:test";
import { effectScope, nextTick, shallowRef } from "vue";
import { useConfirmationFocus } from "../composables/useConfirmationFocus";
import { usePriceRequests } from "../composables/usePriceRequests";

const payload = {
  name: "Prueba local", email: "test@example.test", phone: "600000000",
  message: "Solicitud local de prueba", categorySlug: "presupuesto",
  product: { name: "Prueba", slug: null, sku: null, url: "/" },
  extras: {}, consent: true, sourceUrl: "/pedir-presupuesto", utm: null,
};
const confirmed = { ok: true, duplicated: false, itemId: "42", requestKey: "local" };

for (const outcome of ["created", "duplicate", "incomplete", "network"] as const) {
  test(`el aviso de envío se retira al terminar: ${outcome}`, async (t) => {
    const runtime = globalThis as Record<string, any>;
    const previous = { fetch: runtime.$fetch, notify: runtime.useNotify };
    t.after(() => { runtime.$fetch = previous.fetch; runtime.useNotify = previous.notify; });
    const notices: string[] = [];
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    runtime.useNotify = () => ({
      show: () => { notices.push("show"); return "sending-notice"; },
      dismiss: (id: string) => { assert.equal(id, "sending-notice"); notices.push("dismiss"); },
    });
    runtime.$fetch = async () => {
      await pending;
      if (outcome === "network") throw new TypeError("Network failure");
      if (outcome === "incomplete") return { ok: true };
      return { ...confirmed, duplicated: outcome === "duplicate" };
    };
    const form = usePriceRequests();
    const request = form.sendPriceRequest(payload);
    assert.deepEqual(notices, ["show"]);
    assert.equal(form.isLoading.value, true);
    finish();
    if (outcome === "network" || outcome === "incomplete") await assert.rejects(request);
    else assert.equal((await request)?.ok, true);
    assert.deepEqual(notices, ["show", "dismiss"]);
    assert.equal(form.isLoading.value, false);
    assert.equal(form.success.value, outcome === "created" || outcome === "duplicate");
  });
}

for (const top of [30, 200, 1000]) {
  test(`el foco anuncia la confirmación y solo desplaza si no es visible: top=${top}`, async (t) => {
    const runtime = globalThis as Record<string, any>;
    const previous = { document: runtime.document, window: runtime.window };
    runtime.document = { querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 112 }) }) };
    runtime.window = { innerHeight: 844 };
    const scope = effectScope();
    t.after(() => {
      scope.stop(); runtime.document = previous.document; runtime.window = previous.window;
    });
    const calls: string[] = [];
    const heading = shallowRef<HTMLElement | null>(null);
    scope.run(() => useConfirmationFocus(heading));
    heading.value = {
      focus: (options: FocusOptions) => { assert.equal(options.preventScroll, true); calls.push("focus"); },
      getBoundingClientRect: () => ({ top, bottom: top + 60 }),
      scrollIntoView: () => { calls.push("scroll"); },
    } as unknown as HTMLElement;
    await nextTick(); await nextTick();
    assert.deepEqual(calls, top === 200 ? ["focus"] : ["focus", "scroll"]);
    heading.value = null;
    await nextTick();
    assert.equal(calls.filter((x) => x === "focus").length, 1);
  });
}
