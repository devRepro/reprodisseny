<script setup lang="ts">
import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
import { cn } from "@/lib/utils";

type CategoryTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    intro?: string;
    items?: CategoryTypeItem[];
    sectionId?: string;
    eyebrow?: string;
    class?: string;
    headingClass?: string;
    gridClass?: string;
    cardClass?: string;
  }>(),
  {
    title: "Tipos",
    intro: "",
    items: () => [],
    sectionId: "",
    eyebrow: "Información sobre los diferentes tipos",
    class: "",
    headingClass: "",
    gridClass: "",
    cardClass: "",
  }
);
</script>

<template>
  <section
    v-if="items?.length"
    :id="sectionId"
    :class="cn('space-y-6 md:space-y-8', props.class)"
  >
    <SectionHeading
      as="h3"
      size="subsection"
      :eyebrow="props.eyebrow"
      :title="props.title || 'Tipos'"
      :subtitle="props.intro || ''"
      title-tone="foreground"
      :line="true"
      :class="cn('max-w-3xl', props.headingClass)"
    />

    <div
      :class="
        cn(
          'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
          props.gridClass
        )
      "
    >
      <article
        v-for="item in items"
        :key="item.title"
        :class="
          cn(
            'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
            props.cardClass
          )
        "
      >
        <div
          class="absolute inset-x-0 top-0 h-1 bg-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div class="flex flex-1 flex-col space-y-4">
          <div class="space-y-2">
            <h3
              class="text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
            >
              {{ item.title }}
            </h3>

            <p class="text-sm leading-relaxed text-muted-foreground">
              {{ item.description }}
            </p>
          </div>

          <div v-if="item.features?.length" class="mt-auto flex flex-wrap gap-2 pt-2">
            <span
              v-for="feature in item.features"
              :key="feature"
              class="inline-flex items-center rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {{ feature }}
            </span>
          </div>
        </div>

        <div v-if="item.idealFor" class="mt-6 rounded-xl bg-muted/30 p-4 text-sm">
          <span class="mb-1 block font-semibold text-foreground">Ideal para:</span>
          <span class="leading-relaxed text-muted-foreground">
            {{ item.idealFor }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>