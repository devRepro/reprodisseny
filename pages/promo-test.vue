<script setup lang="ts">
import SolarProtectionHeroBanner from "@/components/shared/banner/SolarProtectionHeroBanner.vue";
import SolarFilmPromo from "@/components/marketing/promo/SolarFilmPromo.vue";

definePageMeta({
  layout: "default",
});
</script>

<template>
  <main>
    <section class="container-content py-12 md:py-16">
      <div class="max-w-3xl space-y-4">
        <p class="text-label text-primary">
          Página de prueba
        </p>

        <h1 class="section-title section-title--page">
          Test de elementos promocionales
        </h1>

        <p class="section-subtitle">
          Esta página sirve para validar el banner full-width, el sheet de desktop y el drawer de mobile.
        </p>
      </div>
    </section>

    <section class="container-content">
      <SolarProtectionHeroBanner
        title="Reduce calor, reflejos y deslumbramiento sin cambiar los cristales"
        image-src="https://media.reprodisseny.com/media/landing/laminas-solares/sala_reunions.webp"
        image-alt="Instalación de láminas solares en cristal para reducir calor y reflejos"
        :bullets="[
          'Instalación para oficinas, locales, escaparates y viviendas',
          'Mejora el confort térmico y visual',
          'Solución limpia sin sustituir los cristales'
        ]"
        primary-label="Pedir presupuesto"
        primary-to="/lp/laminas-solares#quote-form"
        secondary-label="Ver solución de láminas solares"
        secondary-to="/lp/laminas-solares"
        image-position="center center"
        eager
      />
    </section>

    <section class="container-content py-12 md:py-16">
      <div class="grid gap-6 md:grid-cols-3">
        <article class="rounded-2xl border border-border bg-card p-6">
          <h2 class="text-body font-semibold">Prueba desktop</h2>
          <p class="mt-2 text-body-s text-foreground/70">
            En desktop debería aparecer el sheet lateral pasados unos segundos.
          </p>
        </article>

        <article class="rounded-2xl border border-border bg-card p-6">
          <h2 class="text-body font-semibold">Prueba mobile</h2>
          <p class="mt-2 text-body-s text-foreground/70">
            En mobile debería aparecer el drawer inferior después de interacción o scroll.
          </p>
        </article>

        <article class="rounded-2xl border border-border bg-card p-6">
          <h2 class="text-body font-semibold">Prueba CTA</h2>
          <p class="mt-2 text-body-s text-foreground/70">
            Los botones deben llevar a la landing y al formulario.
          </p>
        </article>
      </div>
    </section>

    <SolarFilmPromo />
  </main>
</template>