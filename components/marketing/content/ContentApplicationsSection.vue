<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import {
  introFromKnownData,
  toSimpleGridItems,
  parseJsonObject,
} from "~/utils/content/sectionCardNormalizer";

type ApplicationItem = {
  title?: string;
  description?: string;
  meta?: string;
  tags?: string[];
  icon?: string;
};

type IncomingSection = {
  id?: string;
  key?: string;
  kind?: string;
  title?: string;
  intro?: string;
  body?: string;
  text?: string;
  applicationsData?: unknown;
};

const props = withDefaults(
  defineProps<{
    section?: IncomingSection | null;
    class?: string;
  }>(),
  {
    section: null,
    class: "",
  }
);

function getSource(section?: IncomingSection | null) {
  if (!section) return null;

  if (section.applicationsData) {
    return section.applicationsData;
  }

  return (
    parseJsonObject(section.body) ||
    parseJsonObject(section.text) ||
    section.body ||
    section.text
  );
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeSearchText(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeIconName(value: unknown) {
  const icon = normalizeText(value);

  if (!icon) return "";

  // Permite guardar en SharePoint:
  // "lucide:store" o simplemente "store"
  if (icon.includes(":")) return icon;

  return `lucide:${icon}`;
}

function resolveApplicationIcon(item: ApplicationItem) {
  const text = normalizeSearchText(
    `${item.title || ""} ${item.description || ""} ${item.meta || ""}`
  );

  if (
    text.includes("boda") ||
    text.includes("celebracion") ||
    text.includes("banquete") ||
    text.includes("ceremonia")
  ) {
    return "lucide:party-popper";
  }

  if (
    text.includes("feria") ||
    text.includes("congreso") ||
    text.includes("stand") ||
    text.includes("acreditacion")
  ) {
    return "lucide:badge-check";
  }

  if (
    text.includes("corporativo") ||
    text.includes("empresa") ||
    text.includes("convencion") ||
    text.includes("presentacion")
  ) {
    return "lucide:briefcase-business";
  }

  if (
    text.includes("verano") ||
    text.includes("playa") ||
    text.includes("terraza") ||
    text.includes("festival") ||
    text.includes("exterior")
  ) {
    return "lucide:sun";
  }

  if (
    text.includes("retail") ||
    text.includes("tienda") ||
    text.includes("escaparate") ||
    text.includes("punto de venta")
  ) {
    return "lucide:store";
  }

  if (
    text.includes("campana") ||
    text.includes("promocion") ||
    text.includes("publicitario")
  ) {
    return "lucide:megaphone";
  }

  if (
    text.includes("hotel") ||
    text.includes("restaurante") ||
    text.includes("hosteleria")
  ) {
    return "lucide:concierge-bell";
  }

  if (
    text.includes("oficina") ||
    text.includes("recepcion") ||
    text.includes("corporativa")
  ) {
    return "lucide:building-2";
  }

  if (
    text.includes("envio") ||
    text.includes("packaging") ||
    text.includes("producto")
  ) {
    return "lucide:package";
  }

  return "lucide:sparkles";
}

const source = computed(() => getSource(props.section));

const intro = computed(() => {
  return (
    introFromKnownData(source.value, [
      "intro",
      "lead",
      "summary",
      "description",
    ]) || normalizeText(props.section?.intro)
  );
});

const items = computed<ApplicationItem[]>(() => {
  const parsed = parseJsonObject<any>(source.value);

  const rawItems =
    parsed && typeof parsed === "object" && Array.isArray(parsed.applications)
      ? parsed.applications
      : source.value;

  return toSimpleGridItems(rawItems, {
    fallbackTitlePrefix: "Aplicación",
    metaLabel: "Uso",
    allowUntitled: false,
  }).map((item, index) => {
    const original = Array.isArray(rawItems) ? rawItems[index] : null;

    const explicitIcon =
      original && typeof original === "object" && "icon" in original
        ? normalizeIconName((original as any).icon)
        : "";

    const normalizedItem: ApplicationItem = {
      ...item,
      icon: explicitIcon,
    };

    return {
      ...normalizedItem,
      icon: explicitIcon || resolveApplicationIcon(normalizedItem),
    };
  });
});

const gridClass = computed(() => {
  if (items.value.length === 1) {
    return "max-w-xl";
  }

  if (items.value.length === 2) {
    return "md:grid-cols-2";
  }

  if (items.value.length === 4) {
    return "sm:grid-cols-2 xl:grid-cols-4";
  }

  return "md:grid-cols-2 xl:grid-cols-3";
});

const hasContent = computed(() => intro.value || items.value.length > 0);
</script>

<template>
  <section v-if="hasContent" :class="cn('space-y-6', props.class)">
    <div v-if="intro" class="max-w-3xl">
      <p class="text-body leading-relaxed text-muted-foreground">
        {{ intro }}
      </p>
    </div>

    <div :class="cn('grid gap-4', gridClass)">
      <article
        v-for="(item, index) in items"
        :key="`${item.title}-${index}`"
        class="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      >
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div class="mb-4 flex items-start justify-between gap-4">
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true"
          >
            <Icon :name="item.icon || 'lucide:sparkles'" class="size-5" />
          </div>

          <span
            class="rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-semibold tabular-nums text-muted-foreground"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>
        </div>

        <div class="space-y-2">
          <p
            v-if="item.meta"
            class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {{ item.meta }}
          </p>

          <h3 class="text-base font-semibold leading-snug tracking-tight text-foreground">
            {{ item.title }}
          </h3>

          <p
            v-if="item.description"
            class="text-sm leading-7 text-muted-foreground"
          >
            {{ item.description }}
          </p>
        </div>

        <div v-if="item.tags?.length" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in item.tags"
            :key="tag"
            class="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {{ tag }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>