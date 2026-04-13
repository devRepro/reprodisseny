<script setup lang="ts">
import { computed } from "vue";
import {
  Sparkles,
  ShieldCheck,
  Palette,
  BadgeCheck,
  type LucideIcon,
} from "lucide-vue-next";

type FinishItem = {
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    sectionId?: string;
    title?: string;
    intro?: string;
    items?: FinishItem[];
  }>(),
  {
    sectionId: "",
    title: "Acabados",
    intro: "",
    items: () => [],
  }
);

const normalizedItems = computed(() =>
  (props.items || []).filter(
    (item) =>
      item &&
      String(item.title || "").trim() &&
      String(item.description || "").trim()
  )
);

function iconFor(title: string): LucideIcon {
  const value = String(title || "").toLowerCase();

  if (
    value.includes("laminado") ||
    value.includes("mate") ||
    value.includes("brillo")
  ) {
    return Palette;
  }

  if (
    value.includes("barniz") ||
    value.includes("selectivo") ||
    value.includes("premium")
  ) {
    return Sparkles;
  }

  if (
    value.includes("soft") ||
    value.includes("touch") ||
    value.includes("tacto")
  ) {
    return BadgeCheck;
  }

  if (
    value.includes("exterior") ||
    value.includes("refuerzo") ||
    value.includes("protección") ||
    value.includes("durabilidad")
  ) {
    return ShieldCheck;
  }

  return Sparkles;
}
</script>

<template>
  <section
    :id="sectionId"
    class="space-y-6 rounded-3xl border border-border/60 bg-card p-5 md:p-7"
  >
    <div class="max-w-3xl space-y-3">
      <div
        class="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground"
      >
        Acabados
      </div>

      <div class="space-y-2">
        <h2 class="font-h3 text-foreground">
          {{ title }}
        </h2>

        <p v-if="intro" class="font-body text-muted-foreground">
          {{ intro }}
        </p>
        <p v-else class="font-body text-muted-foreground">
          Diferentes opciones para reforzar la percepción de calidad, la protección
          y el comportamiento del material según su uso final.
        </p>
      </div>
    </div>

    <div
      v-if="normalizedItems.length"
      class="grid gap-4 md:grid-cols-2"
    >
      <article
        v-for="(item, index) in normalizedItems"
        :key="`${sectionId}-${index}-${item.title}`"
        class="group h-full rounded-2xl border border-border/60 bg-background p-5 transition-transform duration-200 hover:-translate-y-0.5"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <component :is="iconFor(item.title)" class="h-5 w-5" />
          </div>

          <div class="min-w-0 space-y-2">
            <div
              class="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
            >
              Acabado {{ String(index + 1).padStart(2, "0") }}
            </div>

            <h3 class="font-h4 text-foreground">
              {{ item.title }}
            </h3>

            <p class="font-body text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>