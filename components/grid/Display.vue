<template>
  <section class="grid-wrapper">
    <!-- Filtros alineados a la derecha -->
<div class="flex justify-end mb-6">
  <div class="flex items-center gap-4">
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
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <Pagination
        :total="totalPages"
        :default-page="currentPage"
        :items-per-page="1"
        @update:page="onPageChange"
        show-edges
        :sibling-count="1"
        v-slot="{ page }"
      >
        <PaginationList v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst />
          <PaginationPrev />

          <template v-for="(item, index) in items" :key="index">
            <PaginationListItem
              v-if="item.type === 'page'"
              :value="item.value"
              as-child
            >
              <Button
                class="w-10 h-10 p-0"
                :variant="item.value === page ? 'default' : 'outline'"
              >
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationList>
      </Pagination>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Pagination,
  PaginationList,
  PaginationListItem,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrev,
  PaginationEllipsis
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  items: Array<any>
  totalPages: number
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'page-change', value: number): void
}>()

const sortBy = ref('name-asc')

const sortedItems = computed(() =>
  [...props.items].sort((a, b) =>
    sortBy.value === 'name-asc'
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title)
  )
)

const paginatedItems = computed(() => {
  const start = (props.currentPage - 1) * 8
  return sortedItems.value.slice(start, start + 8)
})

function onPageChange(page: number) {
  emit('page-change', page)
}
</script>

<style scoped>
.grid-wrapper {
  padding: 2rem;
}
</style>
