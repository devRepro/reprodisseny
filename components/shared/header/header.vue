<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NuxtLink } from "#components";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import SharedMenuCategorias from "@/components/shared/menu/Categorias.vue";
import { Search, Menu, Phone } from "lucide-vue-next";

type Props = {
  phone?: string;
  phoneLabel?: string;
  quoteHref?: string;
};

const props = withDefaults(defineProps<Props>(), {
  phone: "+34932749890",
  phoneLabel: "+34 932 749 890",
  quoteHref: "/presupuesto",
});

const router = useRouter();
const route = useRoute();

// Si ya estás en /buscar, mantenemos el query en el input (buena UX)
const initialQ = computed(() => {
  const q = route.query.q;
  return typeof q === "string" ? q : "";
});

const q = ref(initialQ.value);

function onSubmit() {
  const term = q.value.trim();
  if (!term) return;

  router.push({
    path: "/buscar",
    query: { q: term },
  });
}
</script>

<template>
  <header class="w-full">
    <!-- Top bar -->
    <div
      class="mx-auto max-w-[1440px] h-12 px-20 pb-2 flex items-end justify-between gap-20"
    >
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-end h-10 w-[218px] shrink-0" aria-label="Inicio">
        <SharedLogo class="h-10 w-[218px]" />
        <span class="sr-only">Repro Disseny</span>
      </NuxtLink>

      <!-- Right -->
      <div class="flex items-center gap-4 h-9 shrink-0">
        <a
          :href="`tel:${props.phone}`"
          class="inline-flex items-center gap-2 whitespace-nowrap text-[14px] leading-[20px] font-normal text-[#959595]"
          aria-label="Llamar por teléfono"
        >
          <Phone class="h-4 w-4 shrink-0 text-[#959595]" />
          <span>{{ props.phoneLabel }}</span>
        </a>

        <Button
          as-child
          class="h-9 rounded-lg bg-[#0076B3] px-4 text-[14px] leading-[20px] font-normal text-white hover:bg-[#006aa1]"
        >
          <NuxtLink :to="props.quoteHref">Pide tu presupuesto</NuxtLink>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              class="h-9 w-9 p-0 rounded-lg hover:bg-transparent"
              aria-label="Abrir menú"
            >
              <Menu class="h-6 w-6 text-[#212121]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem as-child>
              <NuxtLink to="/sobre-nosotros" class="w-full">Sobre nosotros</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/contacto" class="w-full">Contacto</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/como-preparar-archivo" class="w-full"
                >Cómo preparar archivo</NuxtLink
              >
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Categories menu -->
    <SharedMenuCategorias />
  </header>
</template>
