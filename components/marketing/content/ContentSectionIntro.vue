<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    as?: "div" | "header";
    class?: string;
    eyebrowClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    maxWidthClass?: string;
  }>(),
  {
    eyebrow: "",
    description: "",
    as: "div",
    class: "",
    eyebrowClass: "",
    titleClass: "",
    descriptionClass: "",
    maxWidthClass: "max-w-3xl",
  }
);
</script>

<template>
  <component
    :is="props.as"
    :class="cn(props.maxWidthClass, props.class)"
  >
    <p
      v-if="props.eyebrow"
      :class="cn('text-label text-primary', props.eyebrowClass)"
    >
      {{ props.eyebrow }}
    </p>

    <h2
      :class="
        cn(
          'mt-2 text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-tight text-foreground',
          props.titleClass
        )
      "
    >
      {{ props.title }}
    </h2>

    <p
      v-if="props.description"
      :class="
        cn(
          'mt-2 max-w-[62ch] text-body text-muted-foreground',
          props.descriptionClass
        )
      "
    >
      {{ props.description }}
    </p>
  </component>
</template>