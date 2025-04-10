<template>
    <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div class="mx-auto grid max-w-screen-xl px-4 pb-8 md:grid-cols-12 lg:gap-12 lg:pb-16 xl:gap-0">
        <div class="content-center justify-self-start md:col-span-7 md:text-start">
          <h1
            class="mb-4 text-4xl font-extrabold leading-none tracking-tight dark:text-white md:max-w-2xl md:text-5xl xl:text-6xl">
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="max-w-2xl text-gray-500 dark:text-gray-400 md:mb-12 md:text-lg mb-3 lg:mb-5 lg:text-xl">
            {{ description }}
          </p>
          <NuxtLink
            v-if="link"
            :to="link"
            class="inline-block rounded-lg bg-primary-700 px-6 py-3.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            Saber más
          </NuxtLink>
        </div>
        <div v-if="image" class="hidden md:col-span-5 md:mt-0 md:flex">
          <img :src="image" :alt="alt || title" class="w-full h-auto rounded-lg" />
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  const props = defineProps({
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false
    },
    image: {
      type: String,
      required: false
    },
    alt: {
      type: String,
      required: false
    }
  })
  </script>
  