<script setup lang="ts">
import { ref, computed, watchEffect } from "vue"

type Block = { type: string; [k: string]: any }
type Tab = { id?: string; title: string; blocks?: Block[] }

const props = defineProps<{ tabs: Tab[] }>()
const safeTabs = computed(() =>
  (props.tabs || [])
    .filter((t) => t?.title)
    .map((t, i) => ({ ...t, id: t.id || `tab-${i}` }))
)

const active = ref<string>("")

watchEffect(() => {
  if (!active.value && safeTabs.value.length) active.value = safeTabs.value[0].id!
})

const activeTab = computed(() => safeTabs.value.find((t) => t.id === active.value))

function onKeydown(e: KeyboardEvent) {
  const tabs = safeTabs.value
  if (!tabs.length) return

  const idx = tabs.findIndex((t) => t.id === active.value)
  if (idx < 0) return

  const move = (nextIdx: number) => {
    active.value = tabs[nextIdx].id!
    requestAnimationFrame(() => {
      document.getElementById(`tab-${tabs[nextIdx].id}`)?.focus()
    })
  }

  if (e.key === "ArrowRight") { e.preventDefault(); move((idx + 1) % tabs.length) }
  if (e.key === "ArrowLeft") { e.preventDefault(); move((idx - 1 + tabs.length) % tabs.length) }
  if (e.key === "Home") { e.preventDefault(); move(0) }
  if (e.key === "End") { e.preventDefault(); move(tabs.length - 1) }
}
</script>

<template>
  <div class="w-full max-w-[1000px]">
    <!-- Tablist -->
    <div
      role="tablist"
      aria-label="Información"
      class="flex flex-wrap gap-2"
      @keydown="onKeydown"
    >
      <button
        v-for="t in safeTabs"
        :key="t.id"
        :id="`tab-${t.id}`"
        role="tab"
        type="button"
        :aria-selected="active === t.id"
        :tabindex="active === t.id ? 0 : -1"
        :aria-controls="`panel-${t.id}`"
        @click="active = t.id!"
        class="h-[38px] px-4 rounded-[6px] text-[16px] leading-[22px] text-[#212121] transition-colors"
        :class="active === t.id ? 'bg-[#EFEFEF]' : 'bg-white'"
      >
        {{ t.title }}
      </button>
    </div>

    <!-- Panel -->
    <div
      :id="`panel-${activeTab?.id}`"
      role="tabpanel"
      :aria-labelledby="activeTab?.id ? `tab-${activeTab.id}` : undefined"
      class="mt-4 w-full p-6 bg-white border border-[#959595] rounded-[6px] shadow-[0px_4px_6px_rgba(0,0,0,0.09)]"
    >
      <template v-if="activeTab?.blocks?.length">
        <template v-for="(b, idx) in activeTab.blocks" :key="idx">
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

          <!-- Si quieres imágenes -->
          <figure v-else-if="b.type === 'image'" class="mt-4">
            <img :src="b.src" :alt="b.alt || activeTab.title" class="w-full rounded-md" loading="lazy" />
            <figcaption v-if="b.caption" class="mt-2 text-sm text-gray-600">{{ b.caption }}</figcaption>
          </figure>
        </template>
      </template>

      <p v-else class="text-sm text-gray-600">Contenido no disponible.</p>
    </div>
  </div>
</template>
