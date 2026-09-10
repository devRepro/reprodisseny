<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { cn } from "@/lib/utils";

type ProductContentNavItem = {
  id: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    items?: ProductContentNavItem[];
    class?: string;
  }>(),
  {
    items: () => [],
    class: "",
  }
);

const activeId = ref("");
let observer: IntersectionObserver | null = null;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sectionIds() {
  return props.items.map((item) => item.id).filter(Boolean);
}

function activeIdFromHash() {
  if (typeof window === "undefined") return "";

  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return sectionIds().includes(id) ? id : "";
}

function disconnectObserver() {
  observer?.disconnect();
  observer = null;
}

async function observeSections() {
  if (typeof window === "undefined") return;

  const ids = sectionIds();
  activeId.value =
    activeIdFromHash() ||
    (ids.includes(activeId.value) ? activeId.value : ids[0] || "");

  disconnectObserver();
  if (!ids.length || !("IntersectionObserver" in window)) return;

  await nextTick();

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => ({
          id: entry.target.id,
          top: entry.boundingClientRect.top,
          ratio: entry.intersectionRatio,
        }))
        .sort((a, b) => {
          const topDiff = Math.abs(a.top) - Math.abs(b.top);
          return topDiff || b.ratio - a.ratio;
        })[0];

      if (visible?.id) {
        activeId.value = visible.id;
      }
    },
    {
      rootMargin: "-24% 0px -62% 0px",
      threshold: [0, 0.18, 0.42, 0.7],
    }
  );

  ids.forEach((id) => {
    const target = document.getElementById(id);
    if (target) observer?.observe(target);
  });
}

function syncActiveIdFromHash() {
  const hashId = activeIdFromHash();
  if (hashId) activeId.value = hashId;
}

function onLinkClick(event: MouseEvent, id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  activeId.value = id;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  history.replaceState(null, "", `#${id}`);
}

watch(
  () => props.items.map((item) => item.id).join("|"),
  () => {
    void observeSections();
  },
  { immediate: true, flush: "post" }
);

onMounted(() => {
  void observeSections();
  syncActiveIdFromHash();
  window.addEventListener("hashchange", syncActiveIdFromHash);
});

onBeforeUnmount(() => {
  disconnectObserver();
  if (typeof window !== "undefined") {
    window.removeEventListener("hashchange", syncActiveIdFromHash);
  }
});
</script>

<template>
  <nav
    v-if="items.length"
    :class="cn('product-content-nav', props.class)"
    aria-label="Información del producto"
  >
    <p class="product-content-nav__eyebrow">Índice</p>

    <ul class="product-content-nav__list">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :aria-current="activeId === item.id ? 'location' : undefined"
          :class="cn('product-content-nav__link', activeId === item.id && 'product-content-nav__link--active')"
          @click="onLinkClick($event, item.id)"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>
