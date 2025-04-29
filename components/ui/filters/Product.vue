<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Define los props que el componente recibe
// Usamos 'modelValue' para poder usar v-model desde el padre
const props = defineProps<{
  modelValue: string // El valor actual de ordenación (ej: 'default', 'name-asc', 'name-desc')
}>()

// Define los eventos que el componente emite
// 'update:modelValue' es el evento estándar para v-model
const emit = defineEmits(['update:modelValue'])

// Función para emitir el evento cuando el valor cambia
function handleUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label for="sort-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">
      Ordenar por:
    </label>
    <Select :model-value="props.modelValue" @update:model-value="handleUpdate">
      <SelectTrigger id="sort-select" class="w-[180px]">
        <SelectValue placeholder="Seleccionar orden" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <!-- <SelectLabel>Opciones</SelectLabel> -->
          <SelectItem value="default">
            Ordena
          </SelectItem>
          <SelectItem value="name-asc">
            Nombre (A-Z)
          </SelectItem>
          <SelectItem value="name-desc">
            Nombre (Z-A)
          </SelectItem>
          <!-- Puedes añadir más opciones aquí (precio, etc.) -->
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>