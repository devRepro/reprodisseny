<script setup lang="ts">

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function onChange(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <Checkbox :checked="modelValue" @update:checked="onChange" />
</template>
