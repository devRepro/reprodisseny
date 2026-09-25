<!-- components/marketing/content/ContentTabs.vue -->
<script setup lang="ts">
import { computed, nextTick, watch } from "vue";
import { cn } from "@/lib/utils";

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    items?: TabItem[];
    ariaLabel?: string;
    keepMounted?: boolean;
    sectionClass?: string;
    scrollerClass?: string;
    listClass?: string;
    tabClass?: string;
    activeTabClass?: string;
    inactiveTabClass?: string;
    panelClass?: string;
  }>(),
  {
    modelValue: "",
    items: () => [],
    ariaLabel: "Contenido",
    keepMounted: true,
    sectionClass: "",
    scrollerClass: "",
    listClass: "",
    tabClass: "",
    activeTabClass: "",
    inactiveTabClass: "",
    panelClass: "",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const safeItems = computed<TabItem[]>(() =>
  (props.items ?? [])
    .map((item) => ({
      ...item,
      id: String(item?.id || "").trim(),
      label: String(item?.label || "").trim(),
      disabled: Boolean(item?.disabled),
    }))
    .filter((item) => item.id && item.label)
);

const safeItemIds = computed(() => safeItems.value.map((item) => item.id));

const activeId = computed({
  get: () => safeItemIds.value.includes(props.modelValue)
    ? props.modelValue
    : safeItemIds.value[0] || "",
  set: (value: string) => {
    if (!safeItems.value.some((item) => item.id === value && !item.disabled)) return;
    emit("update:modelValue", value);
  },
});

watch(
  [() => props.modelValue, () => safeItemIds.value.join("|")],
  () => {
    const nextActiveId = safeItemIds.value.includes(props.modelValue)
      ? props.modelValue
      : safeItemIds.value[0] || "";

    if (props.modelValue !== nextActiveId) {
      emit("update:modelValue", nextActiveId);
    }
  },
  { immediate: true }
);
function domId(value: string, prefix: string) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${prefix}-${normalized || "item"}`;
}

function selectTab(item: TabItem) {
  if (item.disabled) return;
  activeId.value = item.id;
}

async function focusTab(id: string) {
  await nextTick();

  const target = document.getElementById(domId(id, "tab"));
  target?.focus();
}

function selectTabByOffset(offset: number) {
  const enabledItems = safeItems.value.filter((item) => !item.disabled);
  if (!enabledItems.length) return;

  const currentIndex = enabledItems.findIndex((item) => item.id === activeId.value);
  const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (fallbackIndex + offset + enabledItems.length) % enabledItems.length;

  const nextItem = enabledItems[nextIndex];
  if (!nextItem) return;

  selectTab(nextItem);
  focusTab(nextItem.id);
}

function onTabKeydown(event: KeyboardEvent, item: TabItem) {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      selectTabByOffset(1);
      break;

    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      selectTabByOffset(-1);
      break;

    case "Home": {
      event.preventDefault();
      const first = safeItems.value.find((tab) => !tab.disabled);
      if (first) {
        selectTab(first);
        focusTab(first.id);
      }
      break;
    }

    case "End": {
      event.preventDefault();
      const enabledItems = safeItems.value.filter((tab) => !tab.disabled);
      const last = enabledItems[enabledItems.length - 1];
      if (last) {
        selectTab(last);
        focusTab(last.id);
      }
      break;
    }

    case "Enter":
    case " ":
      event.preventDefault();
      selectTab(item);
      break;
  }
}
</script>

<template>
  <section v-if="safeItems.length" :class="cn('w-full', sectionClass)">
    <div :class="cn('content-tabs__scroller w-full overflow-x-auto pb-1', scrollerClass)">
      <div
        role="tablist"
        aria-orientation="horizontal"
        :aria-label="ariaLabel"
        :class="
          cn(
            'inline-flex min-w-full gap-1 rounded-2xl border border-border/60 bg-muted/45 p-1',
            'shadow-[0_14px_40px_-34px_hsl(var(--foreground)/0.32)]',
            listClass
          )
        "
      >
        <button
          v-for="item in safeItems"
          :id="domId(item.id, 'tab')"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="activeId === item.id"
          :aria-controls="domId(item.id, 'tabpanel')"
          :aria-disabled="item.disabled || undefined"
          :tabindex="activeId === item.id ? 0 : -1"
          :disabled="item.disabled"
          :class="
            cn(
              'min-h-11 shrink-0 whitespace-nowrap rounded-xl px-4 py-3 text-label font-semibold transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2',
              tabClass,
              activeId === item.id
                ? cn('bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20', activeTabClass)
                : cn('text-muted-foreground hover:bg-card/80 hover:text-foreground', inactiveTabClass),
              item.disabled && 'cursor-not-allowed opacity-50'
            )
          "
          @click="selectTab(item)"
          @keydown="onTabKeydown($event, item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div v-if="$slots.panel" :class="cn('pt-6 md:pt-8', panelClass)">
      <template v-for="item in safeItems" :key="item.id">
        <div
          v-if="keepMounted || activeId === item.id"
          v-show="activeId === item.id"
          :id="domId(item.id, 'tabpanel')"
          role="tabpanel"
          :aria-labelledby="domId(item.id, 'tab')"
          tabindex="0"
          class="min-w-0 focus-visible:outline-none"
        >
          <slot name="panel" :item="item" :active="activeId === item.id" />
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.content-tabs__scroller {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

@media (max-width: 767px) {
  .content-tabs__scroller {
    mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%);
    padding-inline: 0.25rem;
  }
}
</style>
