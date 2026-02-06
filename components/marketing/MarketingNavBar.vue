<template>
  <nav class="w-full bg-sky-900">
    <div class="mx-auto max-w-7xl px-6">
      <ul class="h-10 flex items-center gap-10 text-sm text-white/90">
        <li v-for="it in items" :key="it.to">
          <NuxtLink :to="it.to" class="hover:text-white">
            {{ it.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; to: string }[]
}>()
</script>
