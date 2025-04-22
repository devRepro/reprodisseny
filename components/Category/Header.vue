<template>
  <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-20">
    <div class="mx-auto grid max-w-screen-xl px-4 md:grid-cols-12 lg:gap-12 xl:gap-0">
      <div class="content-center justify-self-start md:col-span-7 md:text-start">
        <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight dark:text-white md:max-w-2xl md:text-5xl xl:text-6xl">
          {{ title }}
        </h1>
        <p v-if="description" class="max-w-2xl text-gray-600 dark:text-gray-300 md:mb-10 md:text-lg mb-6 lg:mb-8 lg:text-xl">
          {{ description }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            v-if="cta"
            :to="cta.link"
            class="inline-block rounded-lg bg-primary-700 px-6 py-3.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 transition"
          >
            {{ cta.label }}
          </NuxtLink>

          <NuxtLink
            v-if="link"
            :to="link"
            class="inline-block rounded-lg border border-primary-700 px-6 py-3.5 text-center font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-300 dark:hover:bg-primary-900/20 dark:focus:ring-primary-800 transition"
          >
            Saber más
          </NuxtLink>
        </div>
      </div>

      <div v-if="image" class="hidden md:col-span-5 md:mt-0 md:flex">
        <NuxtImg
          :src="image"
          :alt="alt || title"
          class="w-full h-auto rounded-lg shadow-xl"
          width="600"
          height="400"
          format="webp"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

const props = defineProps({
  title: String,
  description: String,
  link: String,
  image: String,
  alt: String,
  structuredData: Object,
  cta: {
    type: Object as PropType<{ label: string; link: string }>,
    required: false
  }
})
</script>
