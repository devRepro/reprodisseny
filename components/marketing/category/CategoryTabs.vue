<!-- components/marketing/category/CategoryTabs.vue -->
<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import { useRoute } from "#imports"
import { cn } from "@/lib/utils"

type TextBlock = { type: "text"; text: string; html?: boolean; format?: "plain" | "html" }
type BulletsBlock = { type: "bullets"; items: string[] }
type ImageBlock = { type: "image"; src: string; alt?: string; caption?: string; width?: number; height?: number }
type Block = TextBlock | BulletsBlock | ImageBlock | { type: string; [k: string]: any }

type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] }
type SafeTab = { id: string; title: string; blocks: Block[] }

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    containerClass?: string
    stickyTop?: number
    /** Ajusta a tu layout (header + barra). Evita que el anchor quede oculto por el sticky. */
    scrollMarginTop?: number
  }>(),
  {
    containerClass: "mx-auto w-full max-w-[1440px] px-6 lg:px-16 xl:px-24",
    stickyTop: 80,
    scrollMarginTop: 170,
  }
)

const route = useRoute()
const activeId = ref("")

function slugify(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

const safeTabs = computed<SafeTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean)
      const id = slugify(t.id || t.title) || `tab-${i}`
      return { id, title: String(t.title).trim(), blocks }
    })
)

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html")
}

function syncActiveFromHash() {
  const hash = String(route.hash || "").replace(/^#/, "")
  if (hash && safeTabs.value.some((t) => t.id === hash)) activeId.value = hash
  else activeId.value = safeTabs.value[0]?.id || ""
}

function onHashChange() {
  syncActiveFromHash()
}

onMounted(() => {
  syncActiveFromHash()
  window.addEventListener("hashchange", onHashChange, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", onHashChange)
})
</script>

<template>
  <section v-if="safeTabs.length" class="bg-background">
    <!-- Barra sticky (shadcn-look) -->
    <div
      class="sticky z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      :style="{ top: `${stickyTop}px` }"
    >
      <div :class="cn(containerClass, 'py-2')">
        <nav aria-label="Contenido de la categoría">
          <ul class="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <li v-for="t in safeTabs" :key="t.id" class="shrink-0">
              <!-- anchor real: SEO + accesibilidad -->
              <a
  :href="`#${t.id}`"
  :aria-current="activeId === t.id ? 'true' : undefined"
  class="inline-flex h-9 items-center rounded-full px-3 text-xs font-medium transition-colors
         focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
  :class="
    activeId === t.id
      ? 'bg-muted text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
  "
  @click="activeId = t.id"
>
  {{ t.title }}
</a>            
</li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Contenido SIEMPRE visible (SSR) -->
    <div :class="cn(containerClass, 'py-10 md:py-12')">
      <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <section
          v-for="t in safeTabs"
          :key="t.id"
          :id="t.id"
          class="border-b border-border/60 px-6 py-10 last:border-b-0 md:px-10 md:py-12"
          :style="{ scrollMarginTop: `${scrollMarginTop}px` }"
        >
          <h2 class="mb-6 text-2xl font-semibold text-foreground">
            {{ t.title }}
          </h2>

          <div class="space-y-6 leading-relaxed text-muted-foreground md:text-[15px]">
            <template v-for="(b, bi) in t.blocks" :key="bi">
              <!-- Nota: si viene de CMS, ideal sanitizar HTML en origen -->
              <div
                v-if="isHtmlTextBlock(b)"
                class="prose prose-slate max-w-none dark:prose-invert"
                v-html="b.text"
              />

              <p v-else-if="b.type === 'text'" class="whitespace-pre-line">
                {{ (b as any).text }}
              </p>

              <ul v-else-if="b.type === 'bullets'" class="grid gap-3 sm:grid-cols-2">
                <li
                  v-for="(it, j) in (b as any).items || []"
                  :key="j"
                  class="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span class="text-sm font-medium text-foreground/90">{{ it }}</span>
                </li>
              </ul>

              <figure v-else-if="b.type === 'image'" class="my-6">
                <NuxtImg
                  :src="(b as any).src"
                  :alt="(b as any).alt || ''"
                  :width="(b as any).width"
                  :height="(b as any).height"
                  class="w-full max-h-[520px] rounded-xl border border-border/60 object-cover"
                  loading="lazy"
                  format="webp"
                  quality="80"
                />
                <figcaption v-if="(b as any).caption" class="mt-2 text-center text-sm text-muted-foreground">
                  {{ (b as any).caption }}
                </figcaption>
              </figure>
            </template>

            <p v-if="!t.blocks.length" class="rounded-lg bg-muted/30 p-4 text-center italic">
              Información no disponible.
            </p>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>