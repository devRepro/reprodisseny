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

  return parseJsonObject(section.body) || parseJsonObject(section.text) || section.body || section.text;
}

const source = computed(() => getSource(props.section));

const intro = computed(() => {
  return (
    introFromKnownData(source.value, ["intro", "lead", "summary", "description"]) ||
    String(props.section?.intro || "").trim()
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

    return {
      ...item,
      icon:
        original && typeof original === "object" && "icon" in original
          ? String((original as any).icon || "")
          : "",
    };
  });
});

const hasContent = computed(() => intro.value || items.value.length > 0);
</script>

<template>
  <section v-if="hasContent" :class="cn('space-y-6', props.class)">
    <p
      v-if="intro"
      class="max-w-3xl text-body leading-relaxed text-muted-foreground"
    >
      {{ intro }}
    </p>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.title"
        class="group rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_10px_30px_-24px_hsl(var(--foreground)/0.18)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_42px_-30px_hsl(var(--foreground)/0.25)]"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary"
            aria-hidden="true"
          >
            <Icon
              v-if="item.icon"
              :name="item.icon"
              class="h-5 w-5"
            />
            <span v-else class="h-2 w-2 rounded-full bg-primary" />
          </div>

          <div class="min-w-0">
            <p
              v-if="item.meta"
              class="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/80"
            >
              {{ item.meta }}
            </p>

            <h3 class="text-base font-semibold leading-snug text-foreground">
              {{ item.title }}
            </h3>

            <p
              v-if="item.description"
              class="mt-2 text-body-s leading-relaxed text-muted-foreground"
            >
              {{ item.description }}
            </p>

            <div v-if="item.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>