<script setup lang="ts">
import ContentSectionShell from "@/components/marketing/content/ContentSectionShell.vue";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type ContentFormatItem = {
  title: string;
  description: string;
};

type ContentFormatsData = {
  intro?: string;
  shapes: ContentFormatItem[];
  deliveryFormats: ContentFormatItem[];
};

withDefaults(
  defineProps<{
    title: string;
    data: ContentFormatsData;
    sectionId?: string;
  }>(),
  {
    sectionId: "",
  }
);
</script>

<template>
  <ContentSectionShell
    :id="sectionId"
    eyebrow="Información de la categoría"
    :title="title"
    :description="data.intro || ''"
    theme="default"
    section-class="scroll-mt-32"
    container-class="container-content"
    intro-class="max-w-4xl"
    body-class="space-y-10 md:space-y-12"
  >
    <!--<div v-if="data.shapes?.length" class="space-y-5">
      <ContentSectionHeader
        title="Formas disponibles"
        as="h3"
        :divider="false"
        class="max-w-3xl"
      />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in data.shapes"
          :key="`shape-${item.title}`"
          class="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
        >
          <div class="space-y-3">
            <h4 class="text-base font-semibold text-foreground">
              {{ item.title }}
            </h4>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <div v-if="data.deliveryFormats?.length" class="space-y-5">
      <ContentSectionHeader
        title="Formato de entrega"
        as="h3"
        :divider="false"
        class="max-w-3xl"
      />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in data.deliveryFormats"
          :key="`delivery-${item.title}`"
          class="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
        >
          <div class="space-y-3">
            <h4 class="text-base font-semibold text-foreground">
              {{ item.title }}
            </h4>
            <p class="text-sm leading-6 text-muted-foreground">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>-->
  </ContentSectionShell>
</template>
