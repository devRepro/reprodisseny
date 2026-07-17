<script setup lang="ts">
import LinkedinIcon from "@/components/shared/icons/social/LinkedinIcon.vue";
import InstagramIcon from "@/components/shared/icons/social/InstagramIcon.vue";

type LinkItem = { label: string; to: string };

const props = withDefaults(
  defineProps<{
    description?: string;
    menuLeft?: LinkItem[];
    menuRight?: LinkItem[];
    linkedinUrl?: string;
    instagramUrl?: string;
  }>(),
  {
    description:
      "Impresión profesional, gran formato, PLV, vinilos, packaging y soluciones gráficas para empresas, retail, eventos y comunicación visual.",
    menuLeft: () => [
      {
        label: "Libros, revistas y catálogos",
        to: "/categorias/libros-revistas-catalogos",
      },
      { label: "Adhesivos", to: "/categorias/adhesivos-personalizados" },
      {
        label: "Material publicitario y oficina",
        to: "/categorias/publicidad-oficina",
      },
      { label: "Gran formato", to: "/categorias/gran-formato" },
    ],
    menuRight: () => [
      { label: "Expositores", to: "/categorias/expositores" },
      { label: "Eventos", to: "/categorias/eventos" },
      {
        label: "Hoteles y restaurantes",
        to: "/categorias/hosteleria-restauracion",
      },
      { label: "Packaging", to: "/categorias/packaging" },
    ],
    linkedinUrl: "https://www.linkedin.com/company/repro-disseny-s.l",
    instagramUrl: "https://www.instagram.com/reprodissenybcn/",
  }
);
</script>

<template>
  <footer class="site-footer">
    <div class="container-wide site-footer__container">
      <div class="site-footer__grid">
        <section class="site-footer__brand">
          <SharedLogo variant="negative" class="site-footer__logo" />

          <p class="site-footer__description">
            {{ props.description }}
          </p>
        </section>

        <nav aria-label="Categorías del sitio" class="site-footer__navigation">
          <div class="site-footer__menu-columns">
            <ul class="site-footer__menu">
              <li v-for="item in props.menuLeft" :key="item.to">
                <NuxtLink :to="item.to" class="site-footer__link">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>

            <ul class="site-footer__menu">
              <li v-for="item in props.menuRight" :key="item.to">
                <NuxtLink :to="item.to" class="site-footer__link">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>

        <address class="site-footer__address">
          <div class="site-footer__contact">
            <p>Juan de Mena 19, 08035 Barcelona</p>

            <p>
              93 274 98 90<br />
              lunes a jueves 8:30-18:00<br />
              viernes 8:00-14:00
            </p>

            <p>
              <a href="mailto:comercial@reprodisseny.com" class="site-footer__link">
                comercial@reprodisseny.com
              </a>
            </p>
          </div>

          <nav aria-label="Redes sociales" class="site-footer__social">
            <a
              :href="props.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Reprodisseny"
              class="site-footer__social-link"
            >
              <LinkedinIcon class="site-footer__social-icon" />
            </a>

            <a
              :href="props.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Reprodisseny"
              class="site-footer__social-link"
            >
              <InstagramIcon class="site-footer__social-icon" />
            </a>
          </nav>
        </address>
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__copyright">
          © {{ new Date().getFullYear() }} Reprodisseny
        </p>

        <nav class="site-footer__legal-links" aria-label="Información legal">
          <NuxtLink to="/politica-privacidad" class="site-footer__legal-link">
            Política de privacidad
          </NuxtLink>

          <NuxtLink to="/politica-cookies" class="site-footer__legal-link">
            Política de cookies
          </NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
