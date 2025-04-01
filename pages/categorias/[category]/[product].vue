<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const { category, product } = route.params

const {data:product} = await useAsyncData('product', () =>

)
</script>
<template>
</template>