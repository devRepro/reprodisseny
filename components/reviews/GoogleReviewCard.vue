<!-- components/GoogleReviews.vue -->
<script setup lang="ts">
const props = defineProps<{ title?: string }>();
const { data, pending, error } = useGoogleReviews({ lang: "es" });
</script>

<template>
  <section class="max-w-3xl mx-auto">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">{{ props.title || "Opiniones de clientes" }}</h2>
      <span class="text-xs opacity-70">Powered by <strong>Google Maps</strong></span>
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
      <div class="space-y-2">
        <div v-for="i in 3" :key="i" class="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="error" class="text-sm text-red-600">
      No se han podido cargar las reseñas.
    </div>

    <div v-else class="space-y-4">
      <div class="text-sm text-muted-foreground">
        <span class="font-medium">{{ data?.value?.rating?.toFixed?.(1) || "—" }}</span>
        / 5 · {{ data?.value?.userRatingCount || 0 }} valoraciones
      </div>

      <ul class="space-y-4">
        <li
          v-for="(r, idx) in data?.value?.reviews"
          :key="idx"
          class="rounded-2xl border p-4 bg-white shadow-sm"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="r.profilePhotoUri"
              :src="r.profilePhotoUri"
              alt=""
              class="h-8 w-8 rounded-full object-cover"
            />
            <div class="text-sm">
              <p class="font-medium">{{ r.author }}</p>
              <p class="text-xs opacity-70">
                {{
                  r.relativeTime ||
                  (r.publishTime ? new Date(r.publishTime).toLocaleDateString() : "")
                }}
              </p>
            </div>
            <div class="ml-auto text-sm font-semibold">{{ r.rating }}★</div>
          </div>
          <p class="mt-2 text-sm leading-relaxed">{{ r.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
