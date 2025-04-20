<template>
  <section>
    <h2 class="text-2xl font-semibold mb-6">Nuestros productos</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="item in items" :key="item.slug">
        <NuxtImg
          :src="item.image"
          :alt="item.title"
          class="rounded-t-lg w-full h-48 object-cover"
          lazy
        />
        <CardContent>
          <CardTitle>{{ item.title }}</CardTitle>
          <p class="text-sm text-gray-600 mb-4">{{ item.description }}</p>
          <Button variant="outline" @click="$emit('inquire', item)">Consultar</Button>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{ items: Array<{ slug: string; title: string; description: string; image: string }>}>
const emit = defineEmits(['inquire'])
</script>