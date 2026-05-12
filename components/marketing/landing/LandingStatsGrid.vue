<script setup lang="ts">
import { computed } from "vue";

type Stat = {
  value: string;
  label: string;
  note?: string;
};

const props = withDefaults(
  defineProps<{
    items?: Stat[];
    class?: string;
  }>(),
  {
    items: () => [],
    class: "",
  }
);

const safeItems = computed(() =>
  props.items
    .map((item) => ({
      value: String(item.value || "").trim(),
      label: String(item.label || "").trim(),
      note: String(item.note || "").trim(),
    }))
    .filter((item) => item.value && item.label)
);
</script>

<template>
  <div
    v-if="safeItems.length"
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    :class="props.class"
  >
    <article
      v-for="item in safeItems"
      :key="`${item.value}-${item.label}`"
      class="rounded-[10px] border border-primary/20 bg-white/[.92] px-5 py-4 text-center shadow-[0_12px_28px_-22px_rgba(0,0,0,.42)]"
    >
      <p class="text-[clamp(1.05rem,2vw,1.45rem)] font-semibold leading-tight tracking-[-0.02em] text-primary">
        {{ item.value }}
      </p>
      <p class="mt-1 text-[13px] font-semibold leading-5 text-foreground/75">
        {{ item.label }}
      </p>
      <p v-if="item.note" class="mt-1.5 text-[11px] leading-4 text-muted-foreground">
        {{ item.note }}
      </p>
    </article>
  </div>
</template>
