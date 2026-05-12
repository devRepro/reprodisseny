<script setup lang="ts">
import CmsImage from "@/components/shared/blocks/CmsImage.vue";
import LandingHeroClaim from "@/components/marketing/landing/LandingHeroClaim.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
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
</script>

<template>
  <section class="landing-hero" :aria-labelledby="props.headingId">
    <CmsImage
      :src="props.imageSrc"
      :alt="props.imageAlt"
      eager
      width="2048"
      height="1066"
      class="landing-hero__image"
    />

    <div class="landing-hero__claim-slot">
      <LandingHeroClaim
        :title="props.title"
        :description="props.description"
        :primary-label="props.primaryLabel"
        :phone-label="props.phoneLabel"
        :phone-href="props.phoneHref"
        :note="props.note"
        :heading-id="props.headingId"
        @primary="emit('primary')"
      />
    </div>
  </section>
</template>

<style scoped>
.landing-hero {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 640px;
  overflow: hidden;
  background: #111827;
}

.landing-hero__image {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.landing-hero__claim-slot {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}

@media (min-width: 768px) {
  .landing-hero {
    min-height: 680px;
  }

  .landing-hero__claim-slot {
    min-height: 680px;
    padding-inline: 40px;
  }
}

@media (min-width: 1024px) {
  .landing-hero {
    height: 750px;
    min-height: 750px;
  }

  .landing-hero__claim-slot {
    position: absolute;
    top: 118px;
    left: clamp(56px, 5.555vw, 80px);
    width: 759px;
    min-height: 0;
    padding: 0;
    display: block;
  }
}
</style>