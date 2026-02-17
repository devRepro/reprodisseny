<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { useRoute, useRouter } from "#imports"

type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
type BulletsBlock = { type: "bullets"; items: string[] }
type ImageBlock = { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
type UnknownBlock = { type: string; [k: string]: any }
type Block = TextBlock | BulletsBlock | ImageBlock | UnknownBlock

type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }
type SafeTab = { id: string; title: string; _blocks: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    wrapperClass?: string
    stickyTopClass?: string
  }>(),
  {
    wrapperClass: "mx-auto max-w-[1440px] px-6 py-12",
    stickyTopClass: "top-[80px]", // ajusta al header
  }
)

const route = useRoute()
const router = useRouter()

const safeTabs = computed<SafeTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = String(t.id ?? "").trim() || `sec-${i}`
      return { id, title: String(t.title).trim(), _blocks: blocks }
    })
)

const activeId = ref("")

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}

function setHash(id: string) {
  router.replace({ hash: `#${id}` }).catch(() => {})
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

function onClickTab(id: string) {
  activeId.value = id
  setHash(id)
  scrollTo(id)
}

onMounted(() => {
  // 1) inicializar con hash si existe
  const hash = String(route.hash || "").replace(/^#/, "")
  const first = safeTabs.value[0]?.id
  activeId.value = safeTabs.value.some((t) => t.id === hash) ? hash : (first || "")

  if (hash && activeId.value) scrollTo(activeId.value)

  // 2) activar tab al hacer scroll
  const io = new IntersectionObserver(
    (entries) => {
      const v = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0]
      if (!v) return
      const id = (v.target as HTMLElement).id
      if (id) activeId.value = id
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: [0.12, 0.2, 0.35] }
  )

  safeTabs.value.forEach((t) => {
    const el = document.getElementById(t.id)
    if (el) io.observe(el)
  })
})
</script>

<template>
  <section v-if="safeTabs.length" class="bg-slate-50/60">
    <div :class="wrapperClass">
      <!-- NAV sticky estilo “underline” (no backoffice) -->
      <div class="sticky z-20 -mx-6 px-6 bg-slate-50/80 backdrop-blur" :class="stickyTopClass">
        <div class="border-b border-slate-200">
          <div class="flex gap-6 overflow-x-auto no-scrollbar">
            <button
              v-for="t in safeTabs"
              :key="t.id"
              type="button"
              class="relative py-4 text-[15px] font-medium whitespace-nowrap transition"
              :class="activeId === t.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'"
              @click="onClickTab(t.id)"
            >
              {{ t.title }}
              <span
                class="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition"
                :class="activeId === t.id ? 'bg-sky-700' : 'bg-transparent'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- CONTENIDO: todas las secciones visibles (SEO) -->
      <div class="mt-8">
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <section
            v-for="(t, idx) in safeTabs"
            :key="t.id"
            :id="t.id"
            class="scroll-mt-[140px]"
            :class="idx ? 'border-t border-slate-200' : ''"
          >
            <div class="px-7 py-7">
              <h2 class="text-[22px] leading-[28px] font-semibold text-slate-900">
                {{ t.title }}
              </h2>

              <div class="mt-4 space-y-4">
                <template v-for="(b, bi) in t._blocks" :key="`${t.id}-${bi}`">
                  <div v-if="isHtmlTextBlock(b)" class="prose max-w-none" v-html="b.text" />

                  <p v-else-if="b.type === 'text'" class="text-[16px] leading-[26px] text-slate-700 whitespace-pre-line">
                    {{ (b as any).text }}
                  </p>

                  <ul v-else-if="b.type === 'bullets'" class="space-y-2">
                    <li
                      v-for="(it, j) in (b as any).items || []"
                      :key="j"
                      class="flex gap-3 text-[16px] leading-[26px] text-slate-700"
                    >
                      <span class="mt-[10px] h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                      <span>{{ it }}</span>
                    </li>
                  </ul>
                </template>

                <p v-if="!t._blocks.length" class="text-sm text-slate-500">Contenido no disponible.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
