<script setup lang="ts">
import ContactHero from "@/components/marketing/contact/ContactHero.vue";
import ContactForm from "@/components/marketing/contact/ContactForm.vue";
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
  </main>
</template>
