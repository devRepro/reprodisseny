<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false,
});

type HeadingTag = "h1" | "h2" | "h3" | "h4";
type HeadingSize = "hero" | "section" | "subsection" | "compact";
type HeadingAlign = "left" | "center";
type HeadingTheme = "default" | "inverse";
type HeadingTone = "brand" | "ink" | "foreground" | "white";

type Props = {
  as?: HeadingTag;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  size?: HeadingSize;
  align?: HeadingAlign;
  theme?: HeadingTheme;
  titleTone?: HeadingTone;
  line?: boolean;
  ornament?: boolean;
  eyebrowClass?: string;
  titleClass?: string;
  subtitleClass?: string;
};

const props = withDefaults(defineProps<Props>(), {
  as: "h2",
  title: "",
  subtitle: "",
  eyebrow: "",
  size: "section",
  align: "left",
  theme: "default",
  titleTone: "foreground",
  line: true,
  ornament: true,
  eyebrowClass: "",
  titleClass: "",
  subtitleClass: "",
});

const attrs = useAttrs();

const headingTag = computed(() => props.as);

const titleSizeClass = computed(() => {
  const map: Record<HeadingSize, string> = {
    hero: "section-title--hero",
    section: "section-title--section",
    subsection: "section-title--subsection",
    compact: "section-title--compact",
  };
  return map[props.size];
});

const titleToneClass = computed(() => {
  const map: Record<HeadingTone, string> = {
    brand: "section-title--brand",
    ink: "section-title--ink",
    foreground: "section-title--foreground",
    white: "section-title--white",
  };

  return props.theme === "inverse" ? "section-title--white" : map[props.titleTone];
});

const eyebrowBaseClass = computed(() =>
  cn(
    "section-eyebrow",
    props.theme === "inverse" && "section-eyebrow--inverse",
    !props.ornament && "before:hidden"
  )
);

const subtitleBaseClass = computed(() =>
  cn(
    "section-subtitle",
    props.align === "center" && "section-subtitle--center",
    props.theme === "inverse" && "text-white/80"
  )
);

const lineClass = computed(() =>
  cn(
    "section-divider",
    props.align === "center" && "section-divider--center",
    props.theme === "inverse" && "section-divider--inverse"
  )
);
</script>

<template>
  <div
    v-bind="attrs"
    :class="
      cn(
        'section-heading space-y-4',
        props.align === 'center' && 'section-heading--center'
      )
    "
  >
    <p v-if="eyebrow" :class="[eyebrowBaseClass, props.eyebrowClass]">
      {{ eyebrow }}
    </p>

    <component
      :is="headingTag"
      :class="['section-title', titleSizeClass, titleToneClass, props.titleClass]"
    >
      <slot>
        {{ title }}
      </slot>
    </component>

    <p v-if="subtitle" :class="[subtitleBaseClass, props.subtitleClass]">
      {{ subtitle }}
    </p>

    <div v-if="line" aria-hidden="true" :class="lineClass" />
  </div>
</template>
