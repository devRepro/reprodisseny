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
    <h1 :id="props.headingId" class="landing-hero-claim__title">
      <template v-if="titleLines.length > 1">
        <span v-for="line in titleLines" :key="line" class="landing-hero-claim__line">
          {{ line }}
        </span>
      </template>
      <template v-else>
        {{ props.title }}
      </template>
    </h1>

    <p class="landing-hero-claim__description">
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
      <span class="landing-hero-claim__phone-label">{{ props.phoneLabel }}</span>
    </a>

    <p v-if="props.note" class="landing-hero-claim__note">
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
  background: #ffffff;
  color: #212121;
  box-shadow: 0 24px 80px rgb(0 0 0 / 16%);
  padding: 32px 24px 30px;
}

.landing-hero-claim__line {
  display: block;
}

.landing-hero-claim__title {
  margin: 0;
  max-width: 660px;
  font-family: Figtree, var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(35px, 9vw, 55px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
  color: #212121;
}

.landing-hero-claim__description {
  margin: 28px 0 0;
  max-width: 650px;
  font-family: Figtree, var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(19px, 4.8vw, 26px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0;
  color: #212121;
}

.landing-hero-claim__button {
  margin-top: 32px;
  width: min(100%, 291px) !important;
  height: 60px !important;
  min-height: 60px !important;
  border-radius: 8px !important;
  padding: 0 24px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #0076b3 !important;
  color: #ffffff !important;
  font-family: Figtree, var(--font-sans, ui-sans-serif, system-ui, sans-serif) !important;
  font-size: 21px !important;
  font-weight: 500 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
}

.landing-hero-claim__phone {
  margin-top: 22px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #8da0b4;
  text-decoration: none;
  transition: color 160ms ease;
}

.landing-hero-claim__phone:hover {
  color: #0076b3;
}

.landing-hero-claim__phone-icon {
  width: 30px;
  height: 30px;
  stroke-width: 1.8;
  flex: 0 0 auto;
}

.landing-hero-claim__phone-label {
  font-family: Figtree, var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(18px, 3vw, 21px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
}

.landing-hero-claim__note {
  margin: 26px 0 0;
  font-family: Figtree, var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: 0;
  color: #0076b3;
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
    height: 514px;
    min-height: 514px;
    padding: 0;
    border-radius: 20px;
  }

  .landing-hero-claim__title {
    position: absolute;
    top: 65px;
    left: 55px;
    width: 650px;
    font-size: 55px;
    line-height: 66px;
    font-weight: 700;
  }

  .landing-hero-claim__description {
    position: absolute;
    top: 225px;
    left: 55px;
    width: 650px;
    margin: 0;
    font-size: 26px;
    line-height: 31px;
    font-weight: 400;
  }

  .landing-hero-claim__button {
    position: absolute !important;
    top: 345px;
    left: 55px;
    margin: 0 !important;
    width: 291px !important;
    height: 60px !important;
  }

  .landing-hero-claim__phone {
    position: absolute;
    top: 362px;
    left: 442px;
    width: 262px;
    height: 26px;
    margin: 0;
    gap: 14px;
    transform: none;
  }

  .landing-hero-claim__phone-icon {
    width: 24px;
    height: 24px;
  }

  .landing-hero-claim__phone-label {
    font-size: 21px;
    font-weight: 700;
    color: #8da0b4;
  }

  .landing-hero-claim__note {
    position: absolute;
    top: 441px;
    left: 55px;
    width: 380px;
    margin: 0;
    font-size: 18px;
    line-height: 22px;
  }
}

@media (max-width: 390px) {
  .landing-hero-claim {
    border-radius: 18px;
    padding-inline: 20px;
  }

  .landing-hero-claim__button {
    font-size: 17px !important;
  }
}
</style>