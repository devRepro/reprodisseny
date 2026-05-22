<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  introFromKnownData,
  toSimpleGridItems,
  parseJsonObject,
} from "~/utils/content/sectionCardNormalizer";

type MaterialItem = {
  title?: string;
  description?: string;
  features?: string[];
  tags?: string[];
  idealFor?: string;
  meta?: string;
  icon?: string;
  tone?: string;
};

type IncomingSection = {
  id?: string;
  key?: string;
  kind?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  materialsData?: unknown;
};

const props = withDefaults(
  defineProps<{
    section?: IncomingSection | null;
    sectionId?: string;
    title?: string;
    intro?: string;
    items?: MaterialItem[];
    class?: string;
  }>(),
  {
    section: null,
    sectionId: "",
    title: "Materiales",
    intro: "",
    items: () => [],
    class: "",
  }
);

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

  // Permite guardar en SharePoint:
  // "lucide:layers-3" o simplemente "layers-3"
  if (icon.includes(":")) return icon;

  return `lucide:${icon}`;
}

function getSource(section?: IncomingSection | null) {
  if (!section) return null;

  if (section.materialsData) {
    return section.materialsData;
  }

  return (
    parseJsonObject(section.body) ||
    parseJsonObject(section.text) ||
    section.body ||
    section.text
  );
}

function resolveMaterialIcon(item: MaterialItem) {
  const text = normalizeSearchText(
    `${item.title || ""} ${item.description || ""} ${item.meta || ""} ${item.idealFor || ""}`
  );

  if (text.includes("transparente") || text.includes("cristal")) {
    return "lucide:scan-line";
  }

  if (
    text.includes("pvc") ||
    text.includes("vinilo") ||
    text.includes("polipropileno") ||
    text.includes("plastico") ||
    text.includes("plástico")
  ) {
    return "lucide:shield-check";
  }

  if (
    text.includes("papel") ||
    text.includes("revestido") ||
    text.includes("estucado")
  ) {
    return "lucide:layers-3";
  }

  if (
    text.includes("natural") ||
    text.includes("kraft") ||
    text.includes("no revestido") ||
    text.includes("mate")
  ) {
    return "lucide:file-text";
  }

  if (
    text.includes("metal") ||
    text.includes("dibond") ||
    text.includes("aluminio")
  ) {
    return "lucide:panel-top";
  }

  if (
    text.includes("carton") ||
    text.includes("cartón") ||
    text.includes("foam")
  ) {
    return "lucide:package";
  }

  if (
    text.includes("tela") ||
    text.includes("textil") ||
    text.includes("poliester") ||
    text.includes("poliéster")
  ) {
    return "lucide:shirt";
  }

  return "lucide:layers";
}

function resolveMaterialTone(item: MaterialItem) {
  const explicitTone = normalizeSearchText(item.tone);

  if (explicitTone) return explicitTone;

  const text = normalizeSearchText(
    `${item.title || ""} ${item.description || ""} ${item.meta || ""} ${item.idealFor || ""}`
  );

  if (text.includes("transparente") || text.includes("cristal")) {
    return "transparent";
  }

  if (text.includes("blanco")) {
    return "white";
  }

  if (
    text.includes("revestido") ||
    text.includes("brillo") ||
    text.includes("estucado")
  ) {
    return "coated";
  }

  if (
    text.includes("no revestido") ||
    text.includes("natural") ||
    text.includes("mate") ||
    text.includes("kraft")
  ) {
    return "natural";
  }

  if (
    text.includes("pvc") ||
    text.includes("vinilo") ||
    text.includes("polipropileno") ||
    text.includes("plastico") ||
    text.includes("plástico")
  ) {
    return "technical";
  }

  if (
    text.includes("premium") ||
    text.includes("especial") ||
    text.includes("metal") ||
    text.includes("dibond") ||
    text.includes("metacrilato")
  ) {
    return "premium";
  }

  return "default";
}

function getToneClasses(tone: string) {
  const classes: Record<string, string> = {
    transparent:
      "bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.10),transparent_38%),hsl(var(--card))]",
    white:
      "bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/0.35)_100%)]",
    coated:
      "bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.13),transparent_42%),hsl(var(--card))]",
    natural:
      "bg-[linear-gradient(135deg,hsl(var(--muted)/0.42)_0%,hsl(var(--card))_58%,hsl(var(--background))_100%)]",
    technical:
      "bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.11),transparent_36%),hsl(var(--card))]",
    premium:
      "bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_40%),hsl(var(--card))]",
    default: "bg-card",
  };

  return classes[tone] || classes.default;
}

const source = computed(() => getSource(props.section));

const resolvedIntro = computed(() => {
  return (
    normalizeText(props.intro) ||
    introFromKnownData(source.value, [
      "intro",
      "lead",
      "summary",
      "description",
    ]) ||
    normalizeText(props.section?.intro)
  );
});

const safeItems = computed<MaterialItem[]>(() => {
  const parsed = parseJsonObject<any>(source.value);

  const rawItems =
    props.items.length > 0
      ? props.items
      : parsed && typeof parsed === "object" && Array.isArray(parsed.materials)
        ? parsed.materials
        : source.value;

  return toSimpleGridItems(rawItems, {
    fallbackTitlePrefix: "Material",
    metaLabel: "Soporte",
    allowUntitled: false,
  })
    .map((item, index) => {
      const original = Array.isArray(rawItems) ? rawItems[index] : null;
      const sourceItem =
        original && typeof original === "object"
          ? (original as MaterialItem)
          : {};

      const title = normalizeText(item.title || sourceItem.title);
      const description = normalizeText(
        item.description || sourceItem.description
      );

      const features = normalizeList(
        item.features?.length ? item.features : sourceItem.features || sourceItem.tags
      );

      const idealFor = normalizeText(item.idealFor || sourceItem.idealFor);
      const meta = normalizeText(item.meta || sourceItem.meta);

      const explicitIcon = normalizeIconName(sourceItem.icon || item.icon);
      const explicitTone = normalizeText(sourceItem.tone || item.tone);

      const normalizedItem: MaterialItem = {
        title,
        description,
        features,
        idealFor,
        meta,
        icon: explicitIcon,
        tone: explicitTone,
      };

      return {
        ...normalizedItem,
        icon: explicitIcon || resolveMaterialIcon(normalizedItem),
        tone: resolveMaterialTone(normalizedItem),
      };
    })
    .filter((item) => item.title && item.description);
});

const gridClass = computed(() => {
  if (safeItems.value.length === 1) {
    return "max-w-xl";
  }

  if (safeItems.value.length === 2) {
    return "md:grid-cols-2";
  }

  if (safeItems.value.length === 4) {
    return "sm:grid-cols-2 xl:grid-cols-4";
  }

  return "md:grid-cols-2 xl:grid-cols-3";
});

const hasContent = computed(
  () => resolvedIntro.value || safeItems.value.length > 0
);
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId || section?.id || undefined"
    :class="cn('space-y-6', props.class)"
  >
    <div v-if="resolvedIntro" class="max-w-3xl">
      <p class="text-body leading-relaxed text-muted-foreground">
        {{ resolvedIntro }}
      </p>
    </div>

    <div :class="cn('grid gap-4', gridClass)">
      <article
        v-for="(item, index) in safeItems"
        :key="`${item.title}-${index}`"
        :class="cn(
          'group relative min-h-[230px] overflow-hidden rounded-3xl border border-border/70 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
          getToneClasses(String(item.tone || 'default'))
        )"
      >
        <div
          class="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/5 transition group-hover:bg-primary/10"
        />

        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div class="relative mb-5 flex items-start justify-between gap-4">
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background/80 text-primary ring-1 ring-primary/15 backdrop-blur-sm transition group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true"
          >
            <Icon :name="item.icon || 'lucide:layers'" class="size-5" />
          </div>

          <span
            class="rounded-full bg-background/70 px-2.5 py-1 text-[0.68rem] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/60"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>
        </div>

        <div class="relative space-y-2">
          <p
            v-if="item.meta"
            class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {{ item.meta }}
          </p>

          <h3 class="text-base font-semibold leading-snug tracking-tight text-foreground">
            {{ item.title }}
          </h3>

          <p class="text-sm leading-7 text-muted-foreground">
            {{ item.description }}
          </p>
        </div>

        <div v-if="item.features?.length" class="relative mt-5 flex flex-wrap gap-2">
          <Badge
            v-for="feature in item.features"
            :key="feature"
            variant="secondary"
            class="rounded-full bg-background/70 text-muted-foreground ring-1 ring-border/60"
          >
            {{ feature }}
          </Badge>
        </div>

        <div
          v-if="item.idealFor"
          class="relative mt-5 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3"
        >
          <p class="mb-0 text-sm leading-6 text-muted-foreground">
            <span class="font-semibold text-foreground">Ideal para: </span>
            {{ item.idealFor }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>