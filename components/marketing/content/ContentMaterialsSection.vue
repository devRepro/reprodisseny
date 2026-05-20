<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Layers, BadgeCheck, ShieldCheck } from "lucide-vue-next";

type MaterialItem = {
  title: string;
  description: string;
  features?: string[];
  idealFor?: string;
};

const props = withDefaults(
  defineProps<{
    sectionId?: string;
    title?: string;
    intro?: string;
    items?: MaterialItem[];
    class?: string;
  }>(),
  {
    sectionId: "",
    title: "Materiales",
    intro: "",
    items: () => [],
    class: "",
  }
);

const safeItems = computed(() =>
  props.items
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      features: Array.isArray(item.features)
        ? item.features.map((feature) => String(feature || "").trim()).filter(Boolean)
        : [],
      idealFor: String(item.idealFor || "").trim(),
    }))
    .filter((item) => item.title && item.description)
);

function iconFor(title: string) {
  const value = title.toLowerCase();

  if (
    value.includes("resistente") ||
    value.includes("pvc") ||
    value.includes("vinilo") ||
    value.includes("exterior")
  ) {
    return ShieldCheck;
  }

  if (
    value.includes("premium") ||
    value.includes("textura") ||
    value.includes("especial")
  ) {
    return BadgeCheck;
  }

  return Layers;
}
</script>

<template>
  <section
    v-if="safeItems.length"
    :id="sectionId || undefined"
    :class="cn('space-y-6', props.class)"
  >
    <p
      v-if="intro"
      class="max-w-3xl text-body leading-relaxed text-muted-foreground"
    >
      {{ intro }}
    </p>

    <div class="grid gap-3">
      <Item
        v-for="item in safeItems"
        :key="item.title"
        variant="outline"
        class="rounded-3xl border-border/70 bg-card/90 p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md"
      >
        <ItemMedia
          variant="icon"
          class="rounded-2xl bg-primary/10 text-primary"
        >
          <component :is="iconFor(item.title)" class="size-5" />
        </ItemMedia>

        <ItemContent class="gap-2">
          <ItemTitle class="text-base font-semibold text-foreground">
            {{ item.title }}
          </ItemTitle>

          <ItemDescription class="text-body-s leading-relaxed text-muted-foreground">
            {{ item.description }}
          </ItemDescription>

          <div v-if="item.features.length" class="mt-2 flex flex-wrap gap-2">
            <Badge
              v-for="feature in item.features"
              :key="feature"
              variant="secondary"
              class="rounded-full"
            >
              {{ feature }}
            </Badge>
          </div>

          <div
            v-if="item.idealFor"
            class="mt-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3"
          >
            <p class="mb-0 text-body-s leading-relaxed text-muted-foreground">
              <span class="font-semibold text-foreground">Ideal para: </span>
              {{ item.idealFor }}
            </p>
          </div>
        </ItemContent>
      </Item>
    </div>
  </section>
</template>