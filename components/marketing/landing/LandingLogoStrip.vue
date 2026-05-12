<script setup lang="ts">
import { computed, ref } from "vue";

type Logo = {
  label: string;
  src?: string;
  alt?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    logos?: Logo[];
  }>(),
  {
    title: "Clientes que confían en nosotros",
    logos: () => [],
  }
);

const failedKeys = ref<Set<string>>(new Set());

const safeLogos = computed(() =>
  props.logos
    .map((logo) => ({
      label: String(logo.label || logo.alt || "").trim(),
      src: String(logo.src || "").trim(),
      alt: String(logo.alt || logo.label || "").trim(),
    }))
    .filter((logo) => logo.label || logo.src)
);

function keyOf(label: string, index: number) {
  return `${index}-${label}`;
}

function markFailed(key: string) {
  const next = new Set(failedKeys.value);
  next.add(key);
  failedKeys.value = next;
}
</script>

<template>
  <section v-if="safeLogos.length" class="bg-[hsl(var(--brand-bg-2))] py-10">
    <div class="container-content">
      <p class="mb-5 text-sm font-semibold text-foreground/80">
        {{ props.title }}
      </p>

      <div
        class="mx-auto grid max-w-4xl grid-cols-2 overflow-hidden rounded-[8px] border border-border/60 bg-white shadow-[0_12px_34px_-28px_rgba(0,0,0,.35)] sm:grid-cols-3 lg:grid-cols-6"
      >
        <div
          v-for="(logo, index) in safeLogos"
          :key="keyOf(logo.label, index)"
          class="flex min-h-[58px] items-center justify-center border-b border-r border-border/50 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/60 last:border-r-0 sm:last:border-r"
        >
          <img
            v-if="logo.src && !failedKeys.has(keyOf(logo.label, index))"
            :src="logo.src"
            :alt="logo.alt"
            class="max-h-7 w-auto max-w-[116px] object-contain opacity-80"
            loading="lazy"
            decoding="async"
            @error="markFailed(keyOf(logo.label, index))"
          />
          <span v-else>{{ logo.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
