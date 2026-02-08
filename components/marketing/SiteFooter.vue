<template>
  <footer class="bg-slate-900 text-white">
    <div class="mx-auto max-w-7xl px-6 py-14">
      <div class="grid gap-10 md:grid-cols-4">
        <div class="space-y-4">
          <img :src="logoSrc" alt="reprodisseny" class="h-8 w-auto opacity-95" />
          <p class="text-xs leading-5 text-white/70">
            {{ aboutText }}
          </p>
        </div>

        <div class="grid gap-2 text-xs text-white/75">
          <div class="text-xs font-semibold text-white">{{ col1Title }}</div>
          <NuxtLink v-for="l in col1" :key="l.to" :to="l.to" class="hover:text-white">
            {{ l.label }}
          </NuxtLink>
        </div>

        <div class="grid gap-2 text-xs text-white/75">
          <div class="text-xs font-semibold text-white">{{ col2Title }}</div>
          <NuxtLink v-for="l in col2" :key="l.to" :to="l.to" class="hover:text-white">
            {{ l.label }}
          </NuxtLink>
        </div>

        <div class="space-y-3 text-xs text-white/75">
          <div class="text-xs font-semibold text-white">{{ addressTitle }}</div>
          <div class="whitespace-pre-line">{{ addressLines }}</div>
          <div>{{ phone }}</div>
          <div class="whitespace-pre-line">{{ hours }}</div>
          <div>{{ email }}</div>

          <div class="flex gap-3 pt-2">
            <a
              v-for="s in socials"
              :key="s.href"
              :href="s.href"
              class="text-white/70 hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              <Icon :name="s.icon" class="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div class="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
        {{ bottomText }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
type Link = { label: string; to: string };
type Social = { icon: string; href: string };

withDefaults(
  defineProps<{
    logoSrc?: string;
    aboutText?: string;
    col1Title?: string;
    col2Title?: string;
    col1?: Link[];
    col2?: Link[];
    addressTitle?: string;
    addressLines?: string;
    phone?: string;
    hours?: string;
    email?: string;
    socials?: Social[];
    bottomText?: string;
  }>(),
  {
    logoSrc: "/img/logo/reprodisseny_blanco.svg",
    aboutText:
      "Lorem ipsum dolor sit amet consectetur. Nunc ultrices ut tellus pellentesque viverra faucibus cras in. Quisque turpis in et ipsum volutpat eu adipiscing habitasse massa.",
    col1Title: "Productos",
    col2Title: "Servicios",
    col1: () => [
      {
        label: "Libros, revistas y catálogos",
        to: "/categorias/libros-revistas-catalogos",
      },
      { label: "Adhesivos", to: "/categorias/adhesivos" },
      { label: "Material publicitario y oficina", to: "/categorias/publicidad-oficina" },
      { label: "Gran formato", to: "/categorias/gran-formato" },
    ],
    col2: () => [
      { label: "Expositores", to: "/categorias/expositores" },
      { label: "Eventos", to: "/categorias/eventos" },
      { label: "Hoteles y restaurantes", to: "/categorias/restauracion" },
      { label: "Packaging", to: "/categorias/packaging" },
    ],
    addressTitle: "Repro Disseny",
    addressLines: "C/ Juan de Mena, 19\n08035, Barcelona",
    phone: "93 274 98 90",
    hours: "lunes a jueves 8:30–18:00\nviernes 8:00–14:00",
    email: "comercial@reprodisseny.com",
    socials: () => [
      { icon: "lucide:linkedin", href: "https://www.linkedin.com" },
      { icon: "lucide:instagram", href: "https://www.instagram.com" },
    ],
    bottomText: "Copyright / Aviso legal",
  }
);
</script>
