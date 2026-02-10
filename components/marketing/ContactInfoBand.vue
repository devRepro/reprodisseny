<template>
  <section class="bg-[#005A78] text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-24">
        <div v-for="b in blocks" :key="b.title" class="text-center">
          <!-- Icono (como la captura: sin círculo) -->
          <Icon :name="b.icon" class="mx-auto h-8 w-8 sm:h-9 sm:w-9 text-white/95" />

          <!-- Título -->
          <div class="mt-6 text-[20px] sm:text-[22px] font-semibold leading-tight">
            {{ b.title }}
          </div>

          <!-- Texto -->
          <div class="mt-4 whitespace-pre-line text-[16px] leading-7 text-white/90">
            {{ b.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Block = { icon: string; title: string; body: string }

withDefaults(
  defineProps<{
    blocks?: Block[]
  }>(),
  {
    blocks: () => [
      {
        icon: "lucide:phone",
        title: "Atención al cliente",
        body:
          "Puedes hablar con nosotros\nlunes a jueves de 8:30h a 18:00h\nviernes de 8:00 a 14:00",
      },
      {
        icon: "lucide:mail",
        title: "Correo electrónico",
        body:
          "Si tienes cualquier duda,\nEscríbenos un email y te\nresponderemos en breve",
      },
      {
        icon: "lucide:map-pin",
        title: "Dirección postal",
        body: "Repro Disseny, SL\nC/ Juan de Mena, 19\n08035, Barcelona",
      },
    ],
  }
)
</script>
