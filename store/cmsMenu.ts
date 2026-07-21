import { defineStore } from "pinia";
import { ref } from "vue";

export const useCmsMenuStore = defineStore(
  "cmsMenu",
  () => {
    const items = ref<any[] | null>(null);
    const loadedAt = ref(0);

    async function ensureLoaded() {
      if (items.value) return;

      const response = await $fetch("/api/cms/categories");

      items.value =
        (response as any)?.items ??
        response;

      loadedAt.value = Date.now();
    }

    return {
      items,
      loadedAt,
      ensureLoaded,
    };
  },
);