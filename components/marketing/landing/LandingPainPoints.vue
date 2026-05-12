<script setup lang="ts">
import { computed } from "vue";

type LandingPainPointIcon = "heat" | "screen" | "furniture" | "energy";

type LandingPainPoint = {
  title: string;
  description: string;
  icon: LandingPainPointIcon;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    items?: LandingPainPoint[];
    id?: string;
  }>(),
  {
    title: "El sol puede ser un problema en tu espacio de trabajo",
    items: () => [],
    id: undefined,
  }
);

const safeItems = computed(() =>
  props.items
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      icon: item.icon,
    }))
    .filter((item) => item.title && item.description)
);
</script>

<template>
  <section :id="id" class="landing-pain-points" aria-labelledby="landing-pain-points-title">
    <div class="landing-pain-points__inner">
      <h2 id="landing-pain-points-title" class="landing-pain-points__title">
        {{ title }}
      </h2>

      <ul v-if="safeItems.length" class="landing-pain-points__list" role="list">
        <li v-for="item in safeItems" :key="item.title" class="landing-pain-points__item">
          <span class="landing-pain-points__icon" aria-hidden="true">
            <svg
              v-if="item.icon === 'heat'"
              class="landing-pain-points__svg landing-pain-points__svg--heat"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.5 5.5v7" />
              <path d="M19.5 31.5v7" />
              <path d="M6.5 18.5h7" />
              <path d="M25.5 18.5h7" />
              <path d="m9.8 8.8 5 5" />
              <path d="m24.2 23.2 5 5" />
              <path d="m29.2 8.8-5 5" />
              <path d="m14.8 23.2-5 5" />
              <circle cx="19.5" cy="18.5" r="8.5" fill="currentColor" stroke="none" />
              <path d="M43 6.5a7 7 0 0 0-7 7v28.35a12 12 0 1 0 14 0V13.5a7 7 0 0 0-7-7Z" />
              <path d="M43 15v27" />
              <path d="M43 52.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" fill="currentColor" stroke="none" />
              <path d="M47 15h6" />
              <path d="M47 23h6" />
              <path d="M47 31h6" />
            </svg>

            <svg
              v-else-if="item.icon === 'screen'"
              class="landing-pain-points__svg landing-pain-points__svg--screen"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22 17h35v28H22z" />
              <path d="M34 54h13" />
              <path d="M40.5 45v9" />
              <path d="M14 18 7 15" />
              <path d="M14 27H5" />
              <path d="m16 36-8 4" />
            </svg>

            <svg
              v-else-if="item.icon === 'furniture'"
              class="landing-pain-points__svg landing-pain-points__svg--furniture"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 8h38v45H13z" />
              <path d="M13 23h38" />
              <path d="M13 38h38" />
              <path d="M29 8v8h6V8" />
              <path d="M29 23v8h6v-8" />
              <path d="M29 38v8h6v-8" />
              <path d="M17 53v6h5l2-6" />
              <path d="M47 53v6h-5l-2-6" />
            </svg>

            <svg
              v-else
              class="landing-pain-points__svg landing-pain-points__svg--energy"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 17h46v26H9z" />
              <path d="M15 36h34" />
              <path d="M16 24h8" />
              <path d="M28 24h23" />
              <path d="M24 49l-2 10" />
              <path d="M34 49l-2 10" />
              <path d="M44 49l-2 10" />
            </svg>
          </span>

          <div class="landing-pain-points__copy">
            <h3 class="landing-pain-points__item-title">
              {{ item.title }}
            </h3>
            <p class="landing-pain-points__description">
              {{ item.description }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.landing-pain-points {
  --solar-pain-bg: #ffe5af;
  --solar-pain-ink: #212121;

  background: var(--solar-pain-bg);
  color: var(--solar-pain-ink);
}

.landing-pain-points__inner {
  width: min(100%, 1440px);
  min-height: 707px;
  margin-inline: auto;
  padding: 108px 0 96px;
}

.landing-pain-points__title {
  width: 100%;
  margin: 0 auto;
  color: var(--solar-pain-ink);
  font-family: var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.01em;
  text-align: center;
}

.landing-pain-points__list {
  width: min(100% - 48px, 888px);
  margin: 58px auto 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 51px;
}

.landing-pain-points__item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  column-gap: 40px;
  align-items: start;
  min-height: 61px;
}

.landing-pain-points__icon {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  color: #000;
}

.landing-pain-points__svg {
  display: block;
  width: 56px;
  height: 56px;
  stroke: currentColor;
  stroke-width: 4.25;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.landing-pain-points__svg--heat {
  width: 58px;
  height: 58px;
  transform: translateY(-2px);
}

.landing-pain-points__svg--screen {
  width: 58px;
  height: 58px;
  transform: translateY(0);
}

.landing-pain-points__svg--furniture {
  width: 58px;
  height: 58px;
  transform: translateY(-1px);
}

.landing-pain-points__svg--energy {
  width: 60px;
  height: 60px;
  transform: translateY(-2px);
}

.landing-pain-points__copy {
  min-width: 0;
  padding-top: 0;
}

.landing-pain-points__item-title {
  margin: 0;
  color: var(--solar-pain-ink);
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.01em;
}

.landing-pain-points__description {
  margin: 8px 0 0;
  color: var(--solar-pain-ink);
  font-family: var(--font-sans);
  font-size: 21px;
  font-weight: 400;
  line-height: 1.24;
  letter-spacing: -0.01em;
}

@media (max-width: 1023px) {
  .landing-pain-points__inner {
    min-height: auto;
    padding: 72px 0;
  }

  .landing-pain-points__title {
    max-width: 760px;
    padding-inline: 24px;
    font-size: clamp(30px, 4.2vw, 36px);
  }

  .landing-pain-points__list {
    width: min(100% - 48px, 820px);
    margin-top: 48px;
    gap: 38px;
  }
}

@media (max-width: 639px) {
  .landing-pain-points__inner {
    padding: 56px 0 60px;
  }

  .landing-pain-points__title {
    padding-inline: 20px;
    font-size: 29px;
    line-height: 1.12;
    text-align: left;
  }

  .landing-pain-points__list {
    width: min(100% - 40px, 420px);
    margin-top: 40px;
    gap: 32px;
  }

  .landing-pain-points__item {
    grid-template-columns: 44px minmax(0, 1fr);
    column-gap: 20px;
    min-height: 0;
  }

  .landing-pain-points__icon {
    width: 44px;
    height: 44px;
  }

  .landing-pain-points__svg,
  .landing-pain-points__svg--heat,
  .landing-pain-points__svg--screen,
  .landing-pain-points__svg--furniture,
  .landing-pain-points__svg--energy {
    width: 44px;
    height: 44px;
    transform: none;
    stroke-width: 4.2;
  }

  .landing-pain-points__item-title {
    font-size: 20px;
    line-height: 1.2;
  }

  .landing-pain-points__description {
    margin-top: 6px;
    font-size: 17px;
    line-height: 1.35;
  }
}
</style>
