<script setup lang="ts">
import { computed, ref, watch } from "vue";

export type ContentTabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    items: ContentTabItem[];
    modelValue?: string;
    ariaLabel?: string;
    keepMounted?: boolean;
    sectionClass?: string;
    panelClass?: string;
  }>(),
  {
    items: () => [],
    modelValue: "",
    ariaLabel: "Contenido por pestañas",
    keepMounted: true,
    sectionClass: "",
    panelClass: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const tabRefs = ref<(HTMLButtonElement | null)[]>([]);
const internalActiveId = ref("");

const enabledItems = computed(() => props.items.filter((item) => !item.disabled));

const firstEnabledId = computed(() => enabledItems.value[0]?.id ?? "");

const activeId = computed(() => {
  const external = String(props.modelValue ?? "").trim();
  if (
    external &&
    props.items.some((item) => item.id === external && !item.disabled)
  ) {
    return external;
  }

  const internal = String(internalActiveId.value ?? "").trim();
  if (
    internal &&
    props.items.some((item) => item.id === internal && !item.disabled)
  ) {
    return internal;
  }

  return firstEnabledId.value;
});

watch(
  () => props.items,
  (items) => {
    if (!items.length) {
      internalActiveId.value = "";
      return;
    }

    const current = activeId.value;
    const stillExists = items.some((item) => item.id === current && !item.disabled);

    if (!stillExists) {
      internalActiveId.value = firstEnabledId.value;
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (value) => {
    const next = String(value ?? "").trim();
    if (!next) return;

    const isValid = props.items.some((item) => item.id === next && !item.disabled);
    if (isValid) {
      internalActiveId.value = next;
    }
  },
  { immediate: true }
);

function setTabRef(el: HTMLButtonElement | null, index: number) {
  tabRefs.value[index] = el;
}

function activateTab(id: string) {
  if (!id) return;

  const tab = props.items.find((item) => item.id === id);
  if (!tab || tab.disabled) return;

  internalActiveId.value = id;
  emit("update:modelValue", id);
  emit("change", id);
}

function focusTabByIndex(index: number) {
  const safeIndex = Math.max(0, Math.min(index, props.items.length - 1));
  const target = props.items[safeIndex];

  if (!target || target.disabled) return;

  tabRefs.value[safeIndex]?.focus();
}

function findNextEnabledIndex(startIndex: number, direction: 1 | -1): number {
  const total = props.items.length;
  if (!total) return -1;

  let cursor = startIndex;

  for (let i = 0; i < total; i += 1) {
    cursor = (cursor + direction + total) % total;
    const candidate = props.items[cursor];

    if (candidate && !candidate.disabled) {
      return cursor;
    }
  }

  return startIndex;
}

function onKeydown(event: KeyboardEvent, index: number) {
  switch (event.key) {
    case "ArrowRight":
    case "Right": {
      event.preventDefault();
      const nextIndex = findNextEnabledIndex(index, 1);
      focusTabByIndex(nextIndex);
      activateTab(props.items[nextIndex]?.id ?? "");
      break;
    }

    case "ArrowLeft":
    case "Left": {
      event.preventDefault();
      const prevIndex = findNextEnabledIndex(index, -1);
      focusTabByIndex(prevIndex);
      activateTab(props.items[prevIndex]?.id ?? "");
      break;
    }

    case "Home": {
      event.preventDefault();
      const firstIndex = props.items.findIndex((item) => !item.disabled);
      if (firstIndex >= 0) {
        focusTabByIndex(firstIndex);
        activateTab(props.items[firstIndex]?.id ?? "");
      }
      break;
    }

    case "End": {
      event.preventDefault();
      const reversedIndex = [...props.items]
        .reverse()
        .findIndex((item) => !item.disabled);

      if (reversedIndex >= 0) {
        const lastIndex = props.items.length - 1 - reversedIndex;
        focusTabByIndex(lastIndex);
        activateTab(props.items[lastIndex]?.id ?? "");
      }
      break;
    }

    case "Enter":
    case " ": {
      event.preventDefault();
      activateTab(props.items[index]?.id ?? "");
      break;
    }
  }
}

function isActive(id: string) {
  return activeId.value === id;
}
</script>

<template>
  <section
    v-if="items.length"
    :class="[
      'w-full space-y-6 md:space-y-8',
      sectionClass,
    ]"
  >
    <div
      class="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        role="tablist"
        :aria-label="ariaLabel"
        class="inline-flex min-w-full items-center gap-2 rounded-[20px] border border-border/60 bg-card/80 p-2 shadow-sm"
      >
        <button
          v-for="(item, index) in items"
          :key="item.id"
          :id="`tab-${item.id}`"
          :ref="(el) => setTabRef(el as HTMLButtonElement | null, index)"
          type="button"
          role="tab"
          :aria-selected="isActive(item.id)"
          :aria-controls="`panel-${item.id}`"
          :tabindex="isActive(item.id) ? 0 : -1"
          :disabled="item.disabled"
          class="inline-flex shrink-0 items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 md:px-5 md:text-[15px]"
          :class="
            isActive(item.id)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground'
          "
          @click="activateTab(item.id)"
          @keydown="onKeydown($event, index)"
        >
          <span class="truncate">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <template v-for="(item, index) in items" :key="item.id">
        <div
          v-if="keepMounted || isActive(item.id)"
          v-show="keepMounted ? isActive(item.id) : true"
          :id="`panel-${item.id}`"
          :aria-labelledby="`tab-${item.id}`"
          role="tabpanel"
          :tabindex="0"
          :class="[
            'min-w-0',
            panelClass,
          ]"
        >
          <slot
            name="panel"
            :item="item"
            :index="index"
            :active-id="activeId"
            :is-active="isActive(item.id)"
          />
        </div>
      </template>
    </div>
  </section>
</template>