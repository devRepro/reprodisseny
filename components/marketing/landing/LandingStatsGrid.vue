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
      class="group relative flex min-h-[150px] flex-col rounded-2xl border border-primary/15 bg-white/90 p-5 text-left shadow-[0_16px_40px_-32px_rgba(15,23,42,.5)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white md:p-6"
    >
      <div
        class="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-primary/35 via-primary/10 to-transparent"
        aria-hidden="true"
      />

      <p
        class="text-[clamp(1.75rem,2.6vw,2.45rem)] font-semibold leading-none tracking-[-0.045em] text-primary"
      >
        {{ item.value }}
      </p>

      <p class="mt-3 text-[15px] font-semibold leading-5 text-foreground">
        {{ item.label }}
      </p>

      <p
        v-if="item.note"
        class="mt-auto pt-5 text-[13px] leading-5 text-foreground/62"
      >
        {{ item.note }}
      </p>
    </article>
  </div>
</template>