import { nextTick, watch, type Ref } from "vue";

/** Move focus only when a confirmation heading is inserted, including inline states. */
export function useConfirmationFocus(heading: Ref<HTMLElement | null>) {
  watch(heading, async (element) => {
    if (!element) return;
    await nextTick();
    if (heading.value !== element) return;
    element.focus({ preventScroll: true });
    const bounds = element.getBoundingClientRect();
    const headerBottom = document.querySelector("[data-site-header]")
      ?.getBoundingClientRect().bottom ?? 80;
    if (bounds.top < headerBottom + 16 || bounds.bottom > window.innerHeight) {
      element.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, { flush: "post" });
}
