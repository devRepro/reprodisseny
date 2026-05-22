<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type FinishItem = {
  title?: string;
  description?: string;
  features?: string[];
  tags?: string[];
  idealFor?: string;
  meta?: string;
  icon?: string;
  tone?: string;
};

type SafeFinishItem = {
  title: string;
  description: string;
  features: string[];
  idealFor?: string;
  meta?: string;
  icon: string;
  tone: string;
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

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeSearchText(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function normalizeIconName(value: unknown) {
  const icon = normalizeText(value);

  if (!icon) return "";
  if (icon.includes(":")) return icon;

  return `lucide:${icon}`;
}

function resolveFinishIcon(item: FinishItem) {
  const text = normalizeSearchText(
    `${item.title || ""} ${item.description || ""} ${item.meta || ""} ${item.idealFor || ""}`
  );

  if (
    text.includes("troquel") ||
    text.includes("corte") ||
    text.includes("forma") ||
    text.includes("silueta")
  ) {
    return "lucide:scissors";
  }

  if (
    text.includes("brillo") ||
    text.includes("barniz") ||
    text.includes("selectivo") ||
    text.includes("premium") ||
    text.includes("metalizado")
  ) {
    return "lucide:sparkles";
  }

  if (
    text.includes("mate") ||
    text.includes("sobrio") ||
    text.includes("reflejo")
  ) {
    return "lucide:palette";
  }

  if (
    text.includes("laminado") ||
    text.includes("proteccion") ||
    text.includes("protección") ||
    text.includes("resistente") ||
    text.includes("durabilidad") ||
    text.includes("exterior")
  ) {
    return "lucide:shield-check";
  }

  if (
    text.includes("soft") ||
    text.includes("touch") ||
    text.includes("tacto")
  ) {
    return "lucide:badge-check";
  }

  if (
    text.includes("hendido") ||
    text.includes("plegado") ||
    text.includes("doblez")
  ) {
    return "lucide:fold-horizontal";
  }

  return "lucide:sparkles";
}

function resolveFinishTone(item: FinishItem) {
  const explicitTone = normalizeSearchText(item.tone);
  if (explicitTone) return explicitTone;

  const text = normalizeSearchText(
    `${item.title || ""} ${item.description || ""} ${item.meta || ""} ${item.idealFor || ""}`
  );

  if (
    text.includes("troquel") ||
    text.includes("corte") ||
    text.includes("forma") ||
    text.includes("silueta")
  ) {
    return "cut";
  }

  if (
    text.includes("brillo") ||
    text.includes("barniz") ||
    text.includes("selectivo") ||
    text.includes("premium") ||
    text.includes("metalizado")
  ) {
    return "gloss";
  }

  if (
    text.includes("mate") ||
    text.includes("sobrio") ||
    text.includes("reflejo")
  ) {
    return "matte";
  }

  if (
    text.includes("laminado") ||
    text.includes("proteccion") ||
    text.includes("protección") ||
    text.includes("resistente") ||
    text.includes("durabilidad") ||
    text.includes("exterior")
  ) {
    return "protection";
  }

  if (
    text.includes("soft") ||
    text.includes("touch") ||
    text.includes("tacto")
  ) {
    return "soft";
  }

  return "default";
}

function getToneClasses(_tone: string) {
  return "bg-card";
}

function getSwatchClasses(tone: string) {
  const classes: Record<string, string> = {
    matte:
      "bg-[radial-gradient(hsl(var(--foreground)/0.10)_1px,transparent_1px)] [background-size:9px_9px]",
    gloss:
      "bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.26)_48%,transparent_100%)]",
    cut:
      "border border-dashed border-primary/35 bg-transparent",
    protection:
      "bg-[linear-gradient(90deg,hsl(var(--primary)/0.16)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--primary)/0.12)_1px,transparent_1px)] [background-size:12px_12px]",
    soft:
      "bg-[radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:12px_12px]",
    default:
      "bg-primary/15",
  };

  return classes[tone] || classes.default;
}

const sectionSubtitle = computed(() => {
  return normalizeText(props.intro) || fallbackIntro;
});

const standaloneIntro = computed(() => {
  if (props.showHeader) return "";
  return sectionSubtitle.value;
});

const normalizedItems = computed<SafeFinishItem[]>(() =>
  (Array.isArray(props.items) ? props.items : [])
    .map((item) => {
      const title = normalizeText(item?.title);
      const description = normalizeText(item?.description);

      if (!title || !description) return null;

      const features = normalizeList(
        Array.isArray(item?.features) && item.features.length
          ? item.features
          : item?.tags
      );

      const normalizedItem: FinishItem = {
        title,
        description,
        features,
        idealFor: normalizeText(item?.idealFor) || undefined,
        meta: normalizeText(item?.meta) || undefined,
        icon: normalizeIconName(item?.icon),
        tone: normalizeText(item?.tone),
      };

      return {
        title,
        description,
        features,
        ...(normalizedItem.idealFor
          ? { idealFor: normalizedItem.idealFor }
          : {}),
        ...(normalizedItem.meta ? { meta: normalizedItem.meta } : {}),
        icon: normalizedItem.icon || resolveFinishIcon(normalizedItem),
        tone: resolveFinishTone(normalizedItem),
      };
    })
    .filter((item): item is SafeFinishItem => Boolean(item))
);

const resolvedGridClass = computed(() => {
  if (props.gridClass) return props.gridClass;

  if (normalizedItems.value.length === 1) {
    return "max-w-xl";
  }

  if (normalizedItems.value.length === 2) {
    return "md:grid-cols-2";
  }

  return "md:grid-cols-2 xl:grid-cols-3";
});
</script>

<template>
  <section v-if="normalizedItems.length" :id="sectionId || undefined"
    :class="cn('space-y-6 md:space-y-8', props.class)">
    <ContentSectionHeader v-if="showHeader && title" as="h3" tone="foreground" :title="props.title"
      :subtitle="sectionSubtitle" :eyebrow="props.eyebrow" :divider="true"
      :class="cn('max-w-3xl', props.headerClass)" />

    <p v-if="standaloneIntro" class="mb-0 max-w-3xl text-body leading-[1.75] text-muted-foreground">
      {{ standaloneIntro }}
    </p>

    <div :class="cn('grid auto-rows-fr gap-4', resolvedGridClass)">
      <article v-for="(item, index) in normalizedItems" :key="`${sectionId || 'finishes'}-${index}-${item.title}`"
        :class="cn(
          'group relative h-full overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md md:p-6',
          props.cardClass
        )
          ">
        <div
          class="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true" />

        <div class="mb-5 flex items-start justify-between gap-4">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true">
            <Icon :name="item.icon || 'lucide:sparkles'" class="size-4.5" />
          </div>

          <span
            class="rounded-full bg-muted/70 px-2.5 py-1 text-[0.68rem] font-semibold tabular-nums text-muted-foreground">
            {{ String(index + 1).padStart(2, "0") }}
          </span>
        </div>

        <div class="space-y-2">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
            {{ item.meta || `Acabado ${String(index + 1).padStart(2, "0")}` }}
          </p>

          <h4 class="text-base font-semibold leading-snug tracking-tight text-foreground">
            {{ item.title }}
          </h4>

          <p class="mb-0 text-sm leading-7 text-muted-foreground">
            {{ item.description }}
          </p>
        </div>

        <div v-if="item.features.length" class="mt-5 flex flex-wrap gap-2">
          <Badge v-for="feature in item.features" :key="`${item.title}-${feature}`" variant="secondary"
            class="rounded-full border border-border/60 bg-background/70 text-muted-foreground">
            {{ feature }}
          </Badge>
        </div>

        <div v-if="item.idealFor" class="mt-5 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
          <span class="mb-1 block text-sm font-semibold text-foreground">
            Mejor para
          </span>

          <p class="mb-0 text-sm leading-6 text-muted-foreground">
            {{ item.idealFor }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
:deep(.content-details--technical) {
  @apply max-w-4xl;
}

:deep(.content-details--technical p) {
  @apply text-sm leading-7 text-muted-foreground md:text-base;
}

:deep(.content-details--technical h2),
:deep(.content-details--technical h3) {
  @apply mb-4 mt-8 inline-flex items-center gap-2.5 rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1.5 text-sm font-semibold tracking-tight text-foreground md:text-base;
}

:deep(.content-details--technical h2)::before,
:deep(.content-details--technical h3)::before {
  content: "";
  @apply size-1.5 shrink-0 rounded-full bg-primary;
}

:deep(.content-details--technical h2:first-child),
:deep(.content-details--technical h3:first-child) {
  @apply mt-0;
}

:deep(.content-details--technical ul) {
  @apply my-4 space-y-4;
}

:deep(.content-details--technical li) {
  @apply text-sm leading-7 text-muted-foreground md:text-base;
}

:deep(.content-details--technical li::marker) {
  @apply text-primary;
}

:deep(.content-details--technical strong) {
  @apply font-semibold text-foreground;
}

:deep(.content-details--technical blockquote) {
  @apply mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-foreground;
}

:deep(.content-details--technical blockquote p) {
  @apply m-0 text-sm leading-7 text-foreground md:text-base;
}
</style>