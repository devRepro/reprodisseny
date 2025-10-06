<template>
  <ul class="space-y-1 pl-4 border-l border-gray-300 dark:border-gray-600">
    <li v-for="item in items" :key="item.path">
      <NuxtLink
        :to="item.path"
        class="text-sm text-gray-700 dark:text-gray-200 hover:underline"
      >
        {{ item.title }}
      </NuxtLink>

      <UiDocsNavigationList
        v-if="item.children?.length"
        :items="item.children"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { NavItem } from '@nuxt/content/dist/runtime/types'

defineProps({
  items: {
    type: Array as PropType<NavItem[]>,
    required: true
  }
})
</script>


