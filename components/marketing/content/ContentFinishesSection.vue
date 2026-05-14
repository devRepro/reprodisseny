<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";
import {
  Sparkles,
  ShieldCheck,
  Palette,
  BadgeCheck,
  Scissors,
  Layers,
  type LucideIcon,
} from "lucide-vue-next";

type FinishItem = {
  title: string;
  description: string;
  features?: string[];
  tags?: string[];
  idealFor?: string;
  meta?: string;
};

type SafeFinishItem = {
  title: string;
  description: string;
  features: string[];
  idealFor?: string;
  meta?: string;
};

const props = withDefaults(
  defineProps<{
    sectionId?: string;
    title?: string;
    intro?: string;
    items?: FinishItem[];
    eyebrow?: string;
    class?: string;
    headerClass?: string;
    gridClass?: string;
    cardClass?: string;
    showHeader?: boolean;
  }>(),
  {
    sectionId: "",
    title: "Acabados",
    intro: "",
    items: () => [],
    eyebrow: "Opciones de acabado",
    class: "",
    headerClass: "",
    gridClass: "",
    cardClass: "",
    showHeader: true,
  }
);

const fallbackIntro =
  "Opciones de acabado pensadas para reforzar la protección, la percepción de calidad y el comportamiento del material según su uso final.";

const sectionSubtitle = computed(() =>
  String(props.intro || "").trim() || fallbackIntro
);

const standaloneIntro = computed(() => {
  if (props.showHeader) return "";
  return sectionSubtitle.value;
});

const normalizedItems = computed<SafeFinishItem[]>(() =>
  (Array.isArray(props.items) ? props.items : [])
    .map((item) => {
      const title = String(item?.title ?? "").trim();
      const description = String(item?.description ?? "").trim();
      const idealFor = String(item?.idealFor ?? "").trim() || undefined;
      const meta = String(item?.meta ?? "").trim() || undefined;

      const featuresSource = Array.isArray(item?.features)
        ? item.features
        : Array.isArray(item?.tags)
          ? item.tags
          : [];

      const features = featuresSource
        .map((feature) => String(feature || "").trim())
        .filter(Boolean);

      if (!title || !description) return null;

      return {
        title,
        description,
        features,
        ...(idealFor ? { idealFor } : {}),
        ...(meta ? { meta } : {}),
      };
    })
    .filter((item): item is SafeFinishItem => Boolean(item))
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
    value.includes("corte") ||
    value.includes("troquel") ||
    value.includes("forma")
  ) {
    return Scissors;
  }

  if (
    value.includes("lamina") ||
    value.includes("lámina") ||
    value.includes("capa") ||
    value.includes("adhesivo")
  ) {
    return Layers;
  }

  if (
    value.includes("exterior") ||
    value.includes("refuerzo") ||
    value.includes("proteccion") ||
    value.includes("protección") ||
    value.includes("durabilidad") ||
    value.includes("resistente")
  ) {
    return ShieldCheck;
  }

  return Sparkles;
}
</script>

<template>
  <section
    v-if="normalizedItems.length"
    :id="sectionId || undefined"
    :class="cn('space-y-6 md:space-y-8', props.class)"
  >
    <ContentSectionHeader
      v-if="showHeader && title"
      as="h3"
      tone="foreground"
      :title="props.title"
      :subtitle="sectionSubtitle"
      :eyebrow="props.eyebrow"
      :divider="true"
      :class="cn('max-w-3xl', props.headerClass)"
    />

    <p
      v-if="standaloneIntro"
      class="mb-0 max-w-3xl text-body leading-[1.75] text-muted-foreground"
    >
      {{ standaloneIntro }}
    </p>

    <div :class="cn('grid auto-rows-fr gap-4 md:grid-cols-2', props.gridClass)">
      <article
        v-for="(item, index) in normalizedItems"
        :key="`${sectionId || 'finishes'}-${index}-${item.title}`"
        :class="
          cn(
            'group h-full rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md md:p-6',
            props.cardClass
          )
        "
      >
        <div class="flex h-full items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <component :is="iconFor(item.title)" class="h-5 w-5" />
          </div>

          <div class="min-w-0 flex-1 space-y-3">
            <div class="space-y-2">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                {{ item.meta || `Acabado ${String(index + 1).padStart(2, "0")}` }}
              </p>

              <h4 class="font-h4 text-foreground">
                {{ item.title }}
              </h4>

              <p class="mb-0 font-body text-sm leading-6 text-muted-foreground">
                {{ item.description }}
              </p>
            </div>

            <div v-if="item.features.length" class="flex flex-wrap gap-2">
              <span
                v-for="feature in item.features"
                :key="`${item.title}-${feature}`"
                class="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-body-s font-medium text-primary"
              >
                {{ feature }}
              </span>
            </div>

            <div
              v-if="item.idealFor"
              class="rounded-2xl border border-primary/10 bg-accent/35 p-4"
            >
              <span class="mb-1 block text-body-s font-semibold text-foreground">
                Ideal para
              </span>

              <p class="mb-0 text-body-s leading-[1.6] text-muted-foreground">
                {{ item.idealFor }}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>