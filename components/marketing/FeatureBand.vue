<template>
  <section class="bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="(f, i) in features"
          :key="i"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Icon v-if="f.icon" :name="f.icon" class="h-5 w-5" />
              <span v-else class="text-sm font-bold">✓</span>
            </div>

            <div>
              <h3 class="text-base font-semibold text-slate-900">{{ f.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ f.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Feature = { title: string; description: string; icon?: string }

withDefaults(defineProps<{ features?: Feature[] }>(), {
  features: () => [
    { title: "Producción propia", description: "Control total de calidad y plazos.", icon: "lucide:factory" },
    { title: "Asesoramiento", description: "Te guiamos en materiales y acabados.", icon: "lucide:messages-square" },
    { title: "Entrega e instalación", description: "Si lo necesitas, nos encargamos del montaje.", icon: "lucide:truck" },
  ],
})
</script>
