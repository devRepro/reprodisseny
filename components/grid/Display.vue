<template>
    <section class="grid-wrapper">
      <!-- Filtros -->
      <div class="flex items-center gap-4 mb-6">
        <Label for="sort">Ordenar por:</Label>
        <Select v-model="sortBy">
          <SelectTrigger id="sort" class="w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <!-- Grid de tarjetas -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SharedCard
          v-for="item in paginatedItems"
          :key="item.id"
          :title="item.title"
          :link="item.link"
          :image="item.image"
        />
      </div>
  
      <!-- Paginación -->
      <div class="mt-8 flex justify-center">
        <Pagination :total="totalPages" :current="currentPage" @update:current="onPageChange" />
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Pagination } from '@/components/ui/pagination'
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from '@/components/ui/select'
  import { Label } from '@/components/ui/label'
  
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
  })
  
  const itemsPerPage = 8
  const sortBy = ref('name-asc')
  const currentPage = ref(1)
  
  const sortedItems = computed(() => {
    return [...props.items].sort((a, b) => {
      return sortBy.value === 'name-asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    })
  })
  
  const totalPages = computed(() => Math.ceil(sortedItems.value.length / itemsPerPage))
  
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return sortedItems.value.slice(start, start + itemsPerPage)
  })
  
  const onPageChange = (page) => {
    currentPage.value = page
  }
  </script>
  
  <style scoped>
  .grid-wrapper {
    padding: 2rem;
  }
  </style>
  