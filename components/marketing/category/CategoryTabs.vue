<script setup lang="ts">
import { ref, computed, watchEffect, resolveComponent } from "vue"

type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
type BulletsBlock = { type: "bullets"; items: string[] }
type ImageBlock = { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
type UnknownBlock = { type: string; [k: string]: any }

type Block = TextBlock | BulletsBlock | ImageBlock | UnknownBlock

type Tab = {
  id?: string
  title: string
  blocks?: Block[]
  content?: Block[]
}

type SafeTab = { id: string; title: string; _blocks: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    wrapperClass?: string
    ariaLabel?: string
    maxWidthClass?: string
  }>(),
  {
    wrapperClass: "mx-auto max-w-7xl px-6 pb-24",
    ariaLabel: "Información",
    maxWidthClass: "max-w-[1000px]",
  }
)

const NuxtImg = (() => {
  try {
    return resolveComponent("NuxtImg") as any
  } catch {
    return null
  }
})()

const safeTabs = computed<SafeTab[]>(() => {
  return (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      return {
        id: String(t.id ?? "").trim() || `tab-${i}`,
        title: String(t.title).trim(),
        _blocks: blocks,
      }
    })
})

const active = ref<string>("")

watchEffect(() => {
  if (!safeTabs.value.length) {
    active.value = ""
    return
  }
  if (!active.value || !safeTabs.value.some((t) => t.id === active.value)) {
    active.value = safeTabs.value[0].id
  }
})

const activeTab = computed(() => safeTabs.value.find((t) => t.id === active.value) || null)

function focusTab(id: string) {
  requestAnimationFrame(() => document.getElementById(`tab-${id}`)?.focus())
}

function onKeydown(e: KeyboardEvent) {
  const tabs = safeTabs.value
  if (!tabs.length) return

  const idx = tabs.findIndex((t) => t.id === active.value)
  if (idx < 0) return

  const move = (nextIdx: number) => {
    const next = tabs[nextIdx]
    active.value = next.id
    focusTab(next.id)
  }

  switch (e.key) {
    case "ArrowRight":
      e.preventDefault()
      move((idx + 1) % tabs.length)
      break
    case "ArrowLeft":
      e.preventDefault()
      move((idx - 1 + tabs.length) % tabs.length)
      break
    case "Home":
      e.preventDefault()
      move(0)
      break
    case "End":
      e.preventDefault()
      move(tabs.length - 1)
      break
  }
}

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}
</script>

<template>
  <section v-if="safeTabs.length" :class="wrapperClass" aria-label="Detalles de la categoría">
    <div class="w-full" :class="maxWidthClass">
      <!-- Tablist -->
      <div role="tablist" :aria-label="ariaLabel" class="flex flex-wrap gap-2" @keydown="onKeydown">
        <button
          v-for="t in safeTabs"
          :key="t.id"
          :id="`tab-${t.id}`"
          role="tab"
          type="button"
          :aria-selected="active === t.id"
          :tabindex="active === t.id ? 0 : -1"
          :aria-controls="`panel-${t.id}`"
          @click="active = t.id"
          class="h-[38px] px-4 rounded-[6px] text-[16px] leading-[22px] text-[#212121] transition-colors"
          :class="active === t.id ? 'bg-[#EFEFEF]' : 'bg-white'"
        >
          {{ t.title }}
        </button>
      </div>

      <!-- Panel -->
      <div
        :id="activeTab ? `panel-${activeTab.id}` : undefined"
        role="tabpanel"
        :aria-labelledby="activeTab ? `tab-${activeTab.id}` : undefined"
        class="mt-4 w-full p-6 bg-white border border-[#959595] rounded-[6px] shadow-[0px_4px_6px_rgba(0,0,0,0.09)]"
      >
        <template v-if="activeTab && activeTab._blocks.length">
          <template v-for="(b, idx) in activeTab._blocks" :key="`${activeTab.id}-${idx}`">
            <!-- TEXT (HTML) -->
            <p v-if="isHtmlTextBlock(b)" class="text-[16px] leading-[22.4px] text-[#212121]" v-html="b.text" />

            <!-- TEXT (PLAIN) -->
            <p v-else-if="b.type === 'text'" class="text-[16px] leading-[22.4px] text-[#212121] whitespace-pre-line">
              {{ (b as any).text }}
            </p>

            <!-- BULLETS -->
            <ul v-else-if="b.type === 'bullets'" class="list-disc pl-5 space-y-2">
              <li v-for="(it, j) in (b as any).items || []" :key="j" class="text-[16px] leading-[22.4px] text-[#212121]">
                {{ it }}
              </li>
            </ul>

            <!-- IMAGE -->
            <figure v-else-if="b.type === 'image'" class="mt-4">
              <component
                v-if="NuxtImg"
                :is="NuxtImg"
                :src="(b as any).src"
                :alt="(b as any).alt || activeTab.title"
                :width="(b as any).width"
                :height="(b as any).height"
                class="w-full rounded-md"
                loading="lazy"
              />
              <img
                v-else
                :src="(b as any).src"
                :alt="(b as any).alt || activeTab.title"
                :width="(b as any).width"
                :height="(b as any).height"
                class="w-full rounded-md"
                loading="lazy"
              />
              <figcaption v-if="(b as any).caption" class="mt-2 text-sm text-gray-600">
                {{ (b as any).caption }}
              </figcaption>
            </figure>
          </template>
        </template>

        <p v-else class="text-sm text-gray-600">Contenido no disponible.</p>
      </div>
    </div>
  </section>
</template>
