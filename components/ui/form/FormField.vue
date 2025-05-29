<script setup lang="ts">
import { Field, useField } from 'vee-validate'
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const { errorMessage, value, meta } = useField(() => props.name)

const error = computed(() => errorMessage.value)
</script>

<template>
  <div>
    <slot :field="{ name: props.name, value, error, meta }" :errors="[error]"></slot>
  </div>
</template>
