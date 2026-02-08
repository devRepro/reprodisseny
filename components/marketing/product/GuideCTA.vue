<script setup lang="ts">
defineProps<{ title: string; ctaLabel: string; ctaTo: string; backgroundSrc: string }>();
</script>

<template>
  <section
    class="w-full h-[225px]"
    :style="{
      backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.85) 53.37%, rgba(0,118,179,0) 100%), url(${backgroundSrc})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="mx-auto max-w-[1440px] h-full flex items-center pl-[231px]">
      <div class="w-[428px] flex flex-col gap-6">
        <h2 class="text-[30px] leading-[36px] font-semibold text-[#212121]">
          {{ title }}
        </h2>
        <NuxtLink
          :to="ctaTo"
          class="w-[155px] h-[38px] rounded-[8px] bg-[#0076B3] text-white inline-flex items-center justify-center"
        >
          {{ ctaLabel }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
