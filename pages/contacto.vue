<script setup lang="ts">
import ContactHero from "@/components/marketing/contact/ContactHero.vue";
import ContactForm from "@/components/marketing/contact/ContactForm.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import LocationMapSection from "@/components/marketing/LocationMapSection.vue";
</script>

<template>
  <main>
    <ContactHero />

    <!-- Sección formulario -->
    <section class="mx-auto max-w-[1440px] px-6">
      <!-- Ajusta este margen para clavar Figma según tu layout -->
      <div class="py-12 flex justify-center">
        <ContactForm />
      </div>
    </section>

    <ContactInfoBand
  section-class="bg-brand-dark text-brand-ink-light py-20"
  container-class="page-shell"
/>
    <LocationMapSection :show-meta="false" :show-floating-cta="false" />
  </main>
</template>
