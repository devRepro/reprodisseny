<script setup lang="ts">
import { computed } from "vue";
import { Phone } from "lucide-vue-next";
import AppButton from "@/components/shared/button/AppButton.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    primaryLabel?: string;
    phoneLabel?: string;
    phoneHref?: string;
    note?: string;
    headingId?: string;
  }>(),
  {
    primaryLabel: "Solicitar presupuesto",
    phoneLabel: "+34 932 749 890",
    phoneHref: "tel:+34932749890",
    note: "Respondemos en menos de 24h laborales",
    headingId: "landing-hero-title",
  }
);

const emit = defineEmits<{
  primary: [];
}>();

const titleLines = computed(() =>
  String(props.title || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const descriptionLines = computed(() =>
  String(props.description || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
);
</script>

<template>
  <article class="landing-hero-claim" aria-label="Solicitud de presupuesto">
    <h1 :id="props.headingId" class="landing-hero-claim__title section-title section-title--hero">
      <template v-if="titleLines.length > 1">
        <span v-for="line in titleLines" :key="line" class="landing-hero-claim__line">
          {{ line }}
        </span>
      </template>
      <template v-else>
        {{ props.title }}
      </template>
    </h1>

    <p class="landing-hero-claim__description text-body">
      <template v-if="descriptionLines.length > 1">
        <span
          v-for="line in descriptionLines"
          :key="line"
          class="landing-hero-claim__line"
        >
          {{ line }}
        </span>
      </template>
      <template v-else>
        {{ props.description }}
      </template>
    </p>

    <AppButton
      variant="primary"
      size="lg"
      class="landing-hero-claim__button"
      @click="emit('primary')"
    >
      {{ props.primaryLabel }}
    </AppButton>

    <a :href="props.phoneHref" class="landing-hero-claim__phone" aria-label="Llamar a Repro Disseny">
      <Phone class="landing-hero-claim__phone-icon" aria-hidden="true" />
      <span class="landing-hero-claim__phone-label text-body-bold">{{ props.phoneLabel }}</span>
    </a>

    <p v-if="props.note" class="landing-hero-claim__note text-body-s">
      {{ props.note }}
    </p>
  </article>
</template>

<style scoped>
.landing-hero-claim {
  position: relative;
  width: min(100%, 759px);
  min-height: 0;
  border-radius: 20px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 24px 80px rgb(0 0 0 / 16%);
  padding: 32px 24px 30px;
}

.landing-hero-claim__line {
  display: block;
}

.landing-hero-claim__title {
  margin: 0;
  max-width: 660px;
  color: hsl(var(--foreground));
}

.landing-hero-claim__description {
  margin: 28px 0 0;
  max-width: 650px;
  color: hsl(var(--foreground));
}

.landing-hero-claim__button {
  margin-top: 32px;
}

.landing-hero-claim__phone {
  margin-top: 22px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  transition: color 160ms ease;
}

.landing-hero-claim__phone:hover {
  color: hsl(var(--primary));
}

.landing-hero-claim__phone-icon {
  width: 30px;
  height: 30px;
  stroke-width: 1.8;
  flex: 0 0 auto;
}

.landing-hero-claim__note {
  margin: 26px 0 0;
  color: hsl(var(--primary));
}

@media (min-width: 640px) {
  .landing-hero-claim {
    padding: 48px 42px 44px;
  }

  .landing-hero-claim__button {
    margin-top: 36px;
  }

  .landing-hero-claim__phone {
    margin-left: 36px;
    margin-top: 0;
    transform: translateY(6px);
  }

  .landing-hero-claim__note {
    margin-top: 30px;
  }
}

@media (min-width: 1024px) {
  .landing-hero-claim {
    width: 759px;
    min-height: 514px;
    height: auto;
    padding: 48px 55px 42px;
    border-radius: 20px;
  }

  .landing-hero-claim__description {
    margin: 22px 0 0;
  }

  .landing-hero-claim__button {
    margin: 28px 0 0;
  }

  .landing-hero-claim__phone {
    width: auto;
    height: auto;
    margin: 0 0 0 36px;
    gap: 14px;
    transform: translateY(6px);
  }

  .landing-hero-claim__phone-icon {
    width: 24px;
    height: 24px;
  }

  .landing-hero-claim__note {
    margin: 24px 0 0;
  }
}

@media (max-width: 390px) {
  .landing-hero-claim {
    border-radius: 18px;
    padding-inline: 20px;
  }
}
</style>