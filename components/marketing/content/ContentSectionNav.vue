<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { cn } from "@/lib/utils";

export type ContentSectionNavItem = {
  id: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    items?: ContentSectionNavItem[];
    stickyTopClass?: string;
    offset?: number;
    class?: string;
    navClass?: string;
    pillsClass?: string;
    itemClass?: string;
    itemActiveClass?: string;
    itemInactiveClass?: string;
  }>(),
  {
    items: () => [],
    stickyTopClass: "top-20 md:top-24",
    offset: 136,
    class: "",
    navClass: "",
    pillsClass: "",
    itemClass: "",
    itemActiveClass:
      "border-primary/20 bg-primary/10 text-primary shadow-[0_8px_20px_-16px_hsl(var(--foreground)/0.18)]",
    itemInactiveClass:
      "border-border bg-card text-foreground/80 hover:border-primary/20 hover:text-primary",
  }
);

const emit = defineEmits<{
  navigate: [id: string];
}>();

const activeId = ref("");
const hasItems = computed(() => props.items.length > 0);

let observer: IntersectionObserver | null = null;

function destroyObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function getTrackedElements() {
  if (!import.meta.client) return [];

  return props.items
    .map((item) => document.getElementById(item.id))
    .filter((el): el is HTMLElement => Boolean(el));
}

function syncActiveFromHash() {
  if (!import.meta.client) return;

  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash) return;

  const exists = props.items.some((item) => item.id === hash);
  if (exists) {
    activeId.value = hash;
  }
}

async function setupObserver() {
  if (!import.meta.client) return;

  destroyObserver();
  await nextTick();

  const elements = getTrackedElements();

  if (!elements.length) {
    activeId.value = "";
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          if (a.intersectionRatio !== b.intersectionRatio) {
            return b.intersectionRatio - a.intersectionRatio;
          }

          const aTop = (a.target as HTMLElement).getBoundingClientRect().top;
          const bTop = (b.target as HTMLElement).getBoundingClientRect().top;
          return Math.abs(aTop) - Math.abs(bTop);
        });

      if (visibleEntries.length) {
        activeId.value = (visibleEntries[0].target as HTMLElement).id;
      }
    },
    {
      root: null,
      rootMargin: "-20% 0px -58% 0px",
      threshold: [0.1, 0.2, 0.35, 0.5, 0.7],
    }
  );

  elements.forEach((el) => observer?.observe(el));

  if (!activeId.value) {
    activeId.value = elements[0].id;
  }

  syncActiveFromHash();
}

function scrollToSection(id: string) {
  if (!import.meta.client) return;

  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - props.offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });

  activeId.value = id;
  emit("navigate", id);

  if (history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  }
}

onMounted(async () => {
  await setupObserver();
  syncActiveFromHash();
});

watch(
  () => props.items.map((item) => item.id).join("|"),
  async () => {
    await setupObserver();
  }
);

onBeforeUnmount(() => {
  destroyObserver();
});
</script>

<template>
  <div
    v-if="hasItems"
    :class="cn('sticky z-20 mt-8', props.stickyTopClass, props.class)"
  >
    <div
      :class="cn('rounded-2xl border border-border/70 bg-background/95 p-3 shadow-[0_10px_24px_-20px_hsl(var(--foreground)/0.16)] backdrop-blur supports-[backdrop-filter]:bg-background/85', props.navClass)"
    >
      <nav aria-label="Navegación interna de contenidos" class="overflow-x-auto">
        <div :class="cn('flex w-max min-w-full gap-2', props.pillsClass)">
          <button
            v-for="item in props.items"
            :key="item.id"
            type="button"
            :aria-current="activeId === item.id ? 'true' : undefined"
            :class="
              cn(
                'inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-body-s transition',
                props.itemClass,
                activeId === item.id ? props.itemActiveClass : props.itemInactiveClass
              )
            "
            @click="scrollToSection(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>
