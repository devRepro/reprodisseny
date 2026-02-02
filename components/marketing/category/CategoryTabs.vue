<script setup lang="ts">
import { computed } from "vue"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type BlockBullets = { type: "bullets"; items: string[] }
type BlockText = { type: "text"; format?: "plain"; text: string }
type BlockImage = { type: "image"; src: string; alt?: string; caption?: string }
type TabBlock = BlockBullets | BlockText | BlockImage | { type: string; [k: string]: any }

type TabAny = {
  title?: string
  label?: string
  name?: string

  // legacy
  bullets?: any[]
  items?: any[]
  points?: any[]

  // new
  blocks?: any[]
}

const props = defineProps<{ tabs: TabAny[] }>()

const s = (v: any) => String(v ?? "").trim()

function normalizeBlock(b: any): TabBlock | null {
  if (!b || typeof b !== "object") return null
  const type = s(b.type).toLowerCase()

  if (type === "bullets") {
    const items = (Array.isArray(b.items) ? b.items : [])
      .map((x: any) => s(x))
      .filter(Boolean)
    return items.length ? { type: "bullets", items } : null
  }

  if (type === "text") {
    const text = s(b.text)
    return text ? { type: "text", format: "plain", text } : null
  }

  if (type === "image") {
    const src = s(b.src)
    if (!src) return null
    const alt = s(b.alt) || undefined
    const caption = s(b.caption) || undefined
    return { type: "image", src, alt, caption }
  }

  // tipos futuros: no rompen (simplemente no los pintamos)
  return { type, ...b }
}

const normalized = computed(() => {
  return (props.tabs || [])
    .map((t) => {
      const title = s(t.title ?? t.label ?? t.name)
      if (!title) return null

      // new format: blocks
      if (Array.isArray(t.blocks)) {
        const blocks = t.blocks.map(normalizeBlock).filter(Boolean) as TabBlock[]
        // nos quedamos solo con los que sabemos pintar (o deja todos si prefieres debug)
        const renderable = blocks.filter((b) => ["bullets", "text", "image"].includes(String(b.type)))
        return renderable.length ? { title, blocks: renderable } : null
      }

      // legacy format: bullets/items/points
      const legacy = Array.isArray(t.bullets) ? t.bullets : Array.isArray(t.items) ? t.items : t.points
      if (Array.isArray(legacy)) {
        const items = legacy.map((x: any) => s(x)).filter(Boolean)
        return items.length ? { title, blocks: [{ type: "bullets", items }] as TabBlock[] } : null
      }

      return null
    })
    .filter(Boolean) as { title: string; blocks: TabBlock[] }[]
})
</script>

<template>
  <section v-if="normalized.length" class="mx-auto max-w-6xl px-6 pb-24">
    <Tabs default-value="0">
      <TabsList class="mb-6 flex flex-wrap">
        <TabsTrigger v-for="(t, i) in normalized" :key="i" :value="String(i)">
          {{ t.title }}
        </TabsTrigger>
      </TabsList>

      <TabsContent v-for="(t, i) in normalized" :key="i" :value="String(i)">
        <div class="rounded-xl border p-8 space-y-6">
          <template v-for="(b, bi) in t.blocks" :key="bi">
            <!-- bullets -->
            <ul v-if="b.type === 'bullets'" class="space-y-2 text-sm text-gray-700">
              <li v-for="it in (b as any).items" :key="it">• {{ it }}</li>
            </ul>

            <!-- text -->
            <p v-else-if="b.type === 'text'" class="text-sm text-gray-700 whitespace-pre-line">
              {{ (b as any).text }}
            </p>

            <!-- image -->
            <figure v-else-if="b.type === 'image'" class="grid gap-2">
              <img
                :src="(b as any).src"
                :alt="(b as any).alt || ''"
                class="h-64 w-full rounded-lg object-cover"
              />
              <figcaption v-if="(b as any).caption" class="text-xs text-gray-500">
                {{ (b as any).caption }}
              </figcaption>
            </figure>

            <!-- otros tipos: no se muestran -->
          </template>
        </div>
      </TabsContent>
    </Tabs>
  </section>
</template>
