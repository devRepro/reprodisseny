<script setup lang="ts">
import HeaderPage from "@/components/shared/hero/HeaderPage.vue";
import ContactForm from "@/components/marketing/contact/ContactForm.vue";
import ContactInfoBand from "@/components/marketing/ContactInfoBand.vue";
import LocationMapSection from "@/components/marketing/LocationMapSection.vue";
</script>

<template>
  <main>
    <HeaderPage
  title="Contáctanos"
  description="Explícanos tu consulta y te responderemos lo antes posible.
Si lo necesitas urgente, mejor llámanos."
/>

    <!-- Sección formulario -->
    <section class="container">
      <!-- Ajusta este margen para clavar Figma según tu layout -->
      <div class="py-12 flex justify-center">
        <ContactForm />
      </div>
    </section>

    <ContactInfoBand
  section-class="bg-brand-dark text-brand-ink-light py-20"
  container-class="container-wide"
/>
    <LocationMapSection :show-meta="false" :show-floating-cta="false" />
  </main>
</template>
