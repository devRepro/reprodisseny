<script setup lang="ts">
type CategoryTypeItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

defineProps<{
  title?: string;
  intro?: string;
  items?: CategoryTypeItem[];
  sectionId?: string;
}>();
</script>

<template>
  <section v-if="items?.length" :id="sectionId" class="space-y-8">
    <div class="space-y-3">
      <h2
        class="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
      >
        {{ title || "Tipos" }}
      </h2>

      <p v-if="intro" class="max-w-3xl text-base leading-7 text-muted-foreground">
        {{ intro }}
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.title"
        class="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="space-y-4">
          <h3 class="text-lg font-semibold leading-tight text-foreground">
            {{ item.title }}
          </h3>

          <p class="text-sm leading-7 text-muted-foreground">
            {{ item.description }}
          </p>

          <div v-if="item.features?.length" class="flex flex-wrap gap-2">
            <span
              v-for="feature in item.features"
              :key="feature"
              class="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              {{ feature }}
            </span>
          </div>
        </div>

        <div
          v-if="item.idealFor"
          class="mt-5 border-t border-border pt-4 text-sm leading-6"
        >
          <span class="font-medium text-foreground">Ideal para:</span>
          <span class="text-muted-foreground"> {{ item.idealFor }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
