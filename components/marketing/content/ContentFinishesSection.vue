<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
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
    eyebrow?: string;
    class?: string;
    headingClass?: string;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    sectionId: "",
    title: "Acabados",
    intro: "",
    items: () => [],
    eyebrow: "Opciones de acabado",
    class: "",
    headingClass: "",
    gridClass: "",
    cardClass: "",
  }
);

const fallbackIntro =
  "Opciones de acabado pensadas para reforzar la protección, la percepción de calidad y el comportamiento del material según su uso final.";

const sectionSubtitle = computed(() =>
  String(props.intro || "").trim() || fallbackIntro
);

const normalizedItems = computed(() =>
  (props.items || []).filter((item) => {
    const title = String(item?.title ?? "").trim();
    const description = String(item?.description ?? "").trim();
    return Boolean(title && description);
  })
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
    value.includes("proteccion") ||
    value.includes("protección") ||
    value.includes("durabilidad")
  ) {
    return ShieldCheck;
  }

  return Sparkles;
}
</script>

<template>
  <section :id="sectionId" :class="cn('space-y-6 md:space-y-8', props.class)">
    <SectionHeading
      as="h3"
      size="subsection"
      :eyebrow="props.eyebrow"
      :title="props.title"
      :subtitle="sectionSubtitle"
      title-tone="foreground"
      :line="true"
      :class="cn('max-w-3xl', props.headingClass)"
    />

    <div
      v-if="normalizedItems.length"
      :class="
        cn(
          'grid gap-4 md:grid-cols-2',
          props.gridClass
        )
      "
    >
      <article
        v-for="(item, index) in normalizedItems"
        :key="`${sectionId || 'finishes'}-${index}-${item.title}`"
        :class="
          cn(
            'group h-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 md:p-6',
            props.cardClass
          )
        "
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <component :is="iconFor(item.title)" class="h-5 w-5" />
          </div>

          <div class="min-w-0 space-y-2">
            <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Acabado {{ String(index + 1).padStart(2, "0") }}
            </p>

            <h4 class="font-h4 text-foreground">
              {{ item.title }}
            </h4>

            <p class="font-body text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>