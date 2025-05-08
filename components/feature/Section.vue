<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="max-w-6xl mx-auto px-6 md:px-8">
      <div
        class="md:flex md:items-center gap-12 md:gap-20"
        :class="{ 'md:flex-row-reverse': reversed }"
      >
        <div class="w-full md:w-[50%] h-auto rounded-lg shadow-md overflow-hidden">
          <img :src="image" :alt="alt" class="w-full h-full object-cover" />
        </div>

        <div class="w-full md:w-[50%] space-y-5">
          <h2 class="text-2xl lg:text-3xl font-bold text-primary">{{ title }}</h2>
          <div class="text-gray-700 text-sm lg:text-base leading-relaxed" v-html="description"></div>
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  reversed: {
    type: Boolean,
    default: false,
  },
});
</script>