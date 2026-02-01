<script setup lang="ts">
  defineProps<{ category: any }>()
  </script>
  
  <template>
    <section class="relative h-[420px] md:h-[520px]">
      <img
        :src="category?.heroImage"
        class="absolute inset-0 h-full w-full object-cover"
        alt=""
      />
      <div class="absolute inset-0 bg-white/70" />
  
      <div class="relative mx-auto max-w-7xl px-6 py-24">
        <h1 class="text-4xl font-semibold">
          {{ category?.title }}
        </h1>
        <p class="mt-4 max-w-xl text-lg text-gray-700">
          {{ category?.excerpt }}
        </p>
      </div>
    </section>
  </template>
  