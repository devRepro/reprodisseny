<!-- components/layout/SiteFooter.vue -->
<script setup lang="ts">
import { Linkedin, Instagram } from "lucide-vue-next";

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
      "Lorem ipsum dolor sit amet consectetur. Nunc ultricies ut tellus pellentesque viverra faucibus cras in. Quisque turpis in elit pretium volutpat eu adipiscing habitasse massa.",
    menuLeft: () => [
      { label: "Libros, revistas y catálogos", to: "/categorias/libros" },
      { label: "Adhesivos", to: "/categorias/adhesivos" },
      {
        label: "Material publicitario y oficina",
        to: "/categorias/material-publicitario",
      },
      { label: "Gran formato", to: "/categorias/gran-formato" },
    ],
    menuRight: () => [
      { label: "Expositores", to: "/categorias/expositores" },
      { label: "Eventos", to: "/categorias/eventos" },
      { label: "Hoteles y restaurantes", to: "/categorias/hosteleria-restauracion" },
      { label: "Packaging", to: "/categorias/packaging" },
    ],
    linkedinUrl: "#",
    instagramUrl: "#",
  }
);
</script>

<template>
  <footer class="w-full bg-[#212121] text-white">
    <!-- Desktop frame: 1440 x 426 -->
    <div class="mx-auto max-w-[1440px] h-[426px] relative">
      <!-- Content area with exact paddings from Figma -->
      <div class="px-[120px] pt-[64px]">
        <div class="grid grid-cols-[206px_1fr_219px] items-start">
          <!-- Logo + story (206 x 176) -->
          <div class="flex flex-col items-start gap-[24px] w-[206px] h-[176px]">
            <!-- Ajusta tu logo para que renderice en blanco -->
            <SharedLogo variant="negative" class="w-[174px] h-[32px]" />
            <p class="w-[206px] text-[14px] leading-[20px] font-normal">
              {{ description }}
            </p>
          </div>

          <!-- Categories (centered block: 343 x 120, gap 40) -->
          <nav aria-label="Categorías" class="w-full">
            <div class="mx-auto flex items-center gap-[40px] w-[343px] h-[120px]">
              <ul
                class="flex flex-col justify-center items-start gap-[16px] w-[170px] h-[120px]"
              >
                <li v-for="item in menuLeft" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="text-[13px] leading-[18px] font-medium hover:underline underline-offset-4"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>

              <ul
                class="flex flex-col justify-center items-start gap-[16px] w-[133px] h-[120px]"
              >
                <li v-for="item in menuRight" :key="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="text-[13px] leading-[18px] font-medium hover:underline underline-offset-4"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </nav>

          <!-- Contact data (219 x 168) with the extra right margin (34px) from Figma -->
          <address
            class="not-italic flex flex-col justify-center items-start gap-[16px] w-[219px] h-[168px] mr-[34px]"
          >
            <p class="w-[219px] text-[14px] leading-[20px] font-normal">
              Juan de Mena 19, 08035 Barcelona
            </p>

            <p class="w-[162px] text-[14px] leading-[20px] font-normal">
              93 274 98 90<br />
              lunes a jueves 8:30-18:00<br />
              viernes 8:00-14:00
            </p>

            <a
              href="mailto:comercial@reprodisseny.com"
              class="w-[187px] text-[14px] leading-[20px] font-normal hover:underline underline-offset-4"
            >
              comercial@reprodisseny.com
            </a>

            <div class="flex items-start gap-[20px] w-[60px] h-[20px]">
              <a :href="props.linkedinUrl" aria-label="LinkedIn" class="inline-flex">
                <Linkedin class="w-[20px] h-[20px]" :stroke-width="1.5" />
              </a>
              <a :href="props.instagramUrl" aria-label="Instagram" class="inline-flex">
                <Instagram class="w-[20px] h-[20px]" :stroke-width="1.5" />
              </a>
            </div>
          </address>
        </div>
      </div>

      <!-- Divider line at y = 350px from top of footer, width 1200 starting at x=120 -->
      <div
        class="absolute top-[350px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1200px] border-t border-white"
      />

      <!-- Bottom links group centered at y = 372px -->
      <div
        class="absolute left-1/2 top-[372px] -translate-x-1/2 flex items-center w-[142px] h-[20px]"
      >
        <NuxtLink
          to="/copyright"
          class="text-[14px] leading-[20px] font-normal hover:underline underline-offset-4"
        >
          Copyright /
        </NuxtLink>
        <NuxtLink
          to="/aviso-legal"
          class="ml-[2px] text-[14px] leading-[20px] font-normal hover:underline underline-offset-4"
        >
          Aviso legal
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
