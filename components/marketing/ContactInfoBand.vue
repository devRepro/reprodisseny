<template>
  <section class="bg-sky-900 py-14 text-white">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-10 md:grid-cols-3">
        <div v-for="b in blocks" :key="b.title" class="text-center">
          <div
            class="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/25"
          >
            <Icon :name="b.icon" class="h-5 w-5 text-white/90" />
          </div>
          <div class="mt-4 text-sm font-semibold">{{ b.title }}</div>
          <div class="mt-2 whitespace-pre-line text-xs leading-5 text-white/75">
            {{ b.body }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Block = { icon: string; title: string; body: string };

withDefaults(
  defineProps<{
    blocks?: Block[];
  }>(),
  {
    blocks: () => [
      {
        icon: "lucide:phone",
        title: "Atención al cliente",
        body:
          "Puedes hablar con nosotros\nlunes a jueves de 8:30 a 18:00h\nviernes de 8:00 a 14:00",
      },
      {
        icon: "lucide:mail",
        title: "Correo electrónico",
        body:
          "Si tienes cualquier duda,\nescríbenos un email y te\nresponderemos en breve",
      },
      {
        icon: "lucide:map-pin",
        title: "Dirección postal",
        body: "Repro Disseny, SL\nC/ Juan de Mena, 19\n08035, Barcelona",
      },
    ],
  }
);
</script>
