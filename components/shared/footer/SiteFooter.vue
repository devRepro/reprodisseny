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
      { label: "Libros, revistas y catálogos", to: "/categorias/libros" },
      { label: "Adhesivos", to: "/categorias/adhesivos" },
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
  <footer class="bg-[hsl(var(--brand-ink-dark))] text-white">
    <div class="container-wide py-12 md:py-14 lg:py-16">
      <div
        class="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(260px,0.9fr)] lg:gap-12"
      >
        <section class="min-w-0">
          <SharedLogo variant="negative" class="h-8 w-auto" />

          <p class="mt-5 max-w-[34ch] text-body-s leading-[1.7] text-white/78">
            {{ props.description }}
          </p>
        </section>

        <nav aria-label="Categorías del sitio" class="min-w-0">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <ul class="space-y-3">
              <li v-for="item in props.menuLeft" :key="item.to">
                <NuxtLink
                  :to="item.to"
                  class="text-body-s leading-[1.6] text-white/82 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>

            <ul class="space-y-3">
              <li v-for="item in props.menuRight" :key="item.to">
                <NuxtLink
                  :to="item.to"
                  class="text-body-s leading-[1.6] text-white/82 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>

        <address class="min-w-0 not-italic">
          <div class="space-y-4 text-body-s leading-[1.65] text-white/82">
            <p>Juan de Mena 19, 08035 Barcelona</p>

            <p>
              93 274 98 90<br />
              lunes a jueves 8:30-18:00<br />
              viernes 8:00-14:00
            </p>

            <p>
              <a
                href="mailto:comercial@reprodisseny.com"
                class="underline-offset-4 transition hover:text-white hover:underline"
              >
                comercial@reprodisseny.com
              </a>
            </p>
          </div>

          <nav
            aria-label="Redes sociales"
            class="mt-5 flex items-center gap-4"
          >
            <a
              :href="props.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Reprodisseny"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/82 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <LinkedinIcon class="h-5 w-5" />
            </a>

            <a
              :href="props.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Reprodisseny"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/82 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <InstagramIcon class="h-5 w-5" />
            </a>
          </nav>
        </address>
      </div>

      <div class="mt-10 border-t border-white/10 pt-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[13px] leading-5 text-white/56">
            © {{ new Date().getFullYear() }} Reprodisseny
          </p>

          <NuxtLink
            to="/politica-privacidad"
            class="text-[13px] leading-5 text-white/72 underline-offset-4 transition hover:text-white hover:underline"
          >
            Aviso legal
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>