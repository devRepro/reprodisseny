<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
defineProps<{ faqs: Array<{ question: string; answer: string }> }>();
const open = ref<number | null>(0);
</script>

<template>
  <div class="w-[1000px] border-t border-[#959595]">
    <div v-for="(f, i) in faqs" :key="i" class="border-b border-[#959595]">
      <button
        class="w-full flex items-center justify-between py-[19px] text-left"
        @click="open = open === i ? null : i"
      >
        <span class="text-[16px] leading-[22.4px] text-[#212121]">{{ f.question }}</span>
        <ChevronDown
          class="w-[11.61px] h-[6.11px] text-[#212121]"
          :class="open === i ? 'rotate-180' : ''"
        />
      </button>
      <div v-if="open === i" class="pb-5 -mt-2">
        <p class="text-[14px] leading-[19.6px] text-[#212121]">{{ f.answer }}</p>
      </div>
    </div>
  </div>
</template>
