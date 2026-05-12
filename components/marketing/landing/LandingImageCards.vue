<script setup lang="ts">
import { computed, ref } from "vue";

type LegacyImage =
  | string
  | {
      url?: string;
      src?: string;
      alt?: string;
    };

type Card = {
  title: string;
  context?: string;
  imageSrc?: string;
  imageAlt?: string;
  src?: string;
  alt?: string;
  image?: LegacyImage;
};

const props = withDefaults(
  defineProps<{
    items?: Card[];
    class?: string;
  }>(),
  {
    items: () => [],
    class: "",
  }
);

const failedImages = ref<Set<string>>(new Set());

function resolveImageSrc(item: Card) {
  if (typeof item.imageSrc === "string" && item.imageSrc.trim()) {
    return item.imageSrc.trim();
  }

  if (typeof item.src === "string" && item.src.trim()) {
    return item.src.trim();
  }

  if (typeof item.image === "string" && item.image.trim()) {
    return item.image.trim();
  }

  if (item.image && typeof item.image === "object") {
    if (typeof item.image.url === "string" && item.image.url.trim()) {
      return item.image.url.trim();
    }

    if (typeof item.image.src === "string" && item.image.src.trim()) {
      return item.image.src.trim();
    }
  }

  return "";
}

function resolveImageAlt(item: Card) {
  if (typeof item.imageAlt === "string" && item.imageAlt.trim()) {
    return item.imageAlt.trim();
  }

  if (typeof item.alt === "string" && item.alt.trim()) {
    return item.alt.trim();
  }

  if (item.image && typeof item.image === "object") {
    if (typeof item.image.alt === "string" && item.image.alt.trim()) {
      return item.image.alt.trim();
    }
  }

  return item.title;
}

const safeItems = computed(() =>
  props.items
    .map((item, index) => {
      const title = String(item.title || "").trim();
      const imageSrc = resolveImageSrc(item);
      const imageAlt = resolveImageAlt(item);

      return {
        key: `${index}-${title}-${imageSrc}`,
        title,
        context: String(item.context || "").trim(),
        imageSrc,
        imageAlt,
      };
    })
    .filter((item) => item.title)
);

function markImageFailed(key: string) {
  const next = new Set(failedImages.value);
  next.add(key);
  failedImages.value = next;
}
</script>

<template>
  <div v-if="safeItems.length" class="landing-image-cards" :class="props.class">
    <article
      v-for="item in safeItems"
      :key="item.key"
      class="landing-image-card"
    >
      <div class="landing-image-card__media">
        <img
          v-if="item.imageSrc && !failedImages.has(item.key)"
          :src="item.imageSrc"
          :alt="item.imageAlt"
          class="landing-image-card__image"
          loading="lazy"
          decoding="async"
          @error="markImageFailed(item.key)"
        />

        <div v-else class="landing-image-card__fallback">
          <span class="landing-image-card__fallback-text">
            Imagen no disponible
          </span>
        </div>
      </div>

      <h3 class="landing-image-card__title">
        {{ item.title }}
      </h3>

      <p v-if="item.context" class="landing-image-card__context">
        {{ item.context }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.landing-image-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px;
  width: min(100%, 1056px);
  margin-inline: auto;
}

.landing-image-card {
  min-width: 0;
  text-align: center;
}

.landing-image-card__media {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 10px;
  background: hsl(var(--muted));
}

.landing-image-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.landing-image-card__fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(
      135deg,
      hsl(var(--brand-base-light)) 0%,
      hsl(var(--background)) 100%
    );
}

.landing-image-card__fallback-text {
  color: hsl(var(--muted-foreground));
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.3;
}

.landing-image-card__title {
  margin: 26px 0 0;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.landing-image-card__context {
  margin: 8px 0 0;
  color: hsl(var(--muted-foreground));
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.35;
}

@media (max-width: 1023px) {
  .landing-image-cards {
    max-width: 720px;
    grid-template-columns: 1fr;
    gap: 42px;
  }

  .landing-image-card {
    width: min(100%, 420px);
    margin-inline: auto;
  }
}

@media (max-width: 639px) {
  .landing-image-cards {
    gap: 34px;
  }

  .landing-image-card__title {
    margin-top: 18px;
    font-size: 18px;
  }
}
</style>