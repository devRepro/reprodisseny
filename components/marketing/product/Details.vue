<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
type Tab = { title: string; blocks?: any[] };
const props = defineProps<{ tabs: Tab[] }>();
const safeTabs = computed(() => (props.tabs || []).filter((t) => t?.title));
const active = ref("");
watchEffect(() => {
  if (!active.value && safeTabs.value.length) active.value = safeTabs.value[0].title;
});
</script>

<template>
  <div class="w-[1000px]">
    <div class="flex justify-between gap-2">
      <button
        v-for="t in safeTabs"
        :key="t.title"
        type="button"
        @click="active = t.title"
        class="h-[38px] px-4 rounded-[6px] text-[16px] leading-[22px] text-[#212121]"
        :class="active === t.title ? 'bg-[#EFEFEF]' : 'bg-white'"
      >
        {{ t.title }}
      </button>
    </div>

    <div
      class="mt-4 w-[1000px] p-6 bg-white border border-[#959595] rounded-[6px] shadow-[0px_4px_6px_rgba(0,0,0,0.09)]"
    >
      <template
        v-for="(b, idx) in safeTabs.find((x) => x.title === active)?.blocks || []"
        :key="idx"
      >
        <p v-if="b.type === 'text'" class="text-[16px] leading-[22.4px] text-[#212121]">
          {{ b.text }}
        </p>
        <ul v-else-if="b.type === 'bullets'" class="list-disc pl-5 space-y-2">
          <li
            v-for="(it, j) in b.items || []"
            :key="j"
            class="text-[16px] leading-[22.4px] text-[#212121]"
          >
            {{ it }}
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
