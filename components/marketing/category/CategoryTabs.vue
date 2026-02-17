<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRoute } from "#imports";

// --- TIPOS ---
type TextBlock = {
  type: "text";
  text: string;
  html?: boolean;
  format?: "plain" | "html";
};
type BulletsBlock = { type: "bullets"; items: string[] };
type ImageBlock = {
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};
type UnknownBlock = { type: string; [k: string]: any };
type Block = TextBlock | BulletsBlock | ImageBlock | UnknownBlock;

type Tab = { id?: string; title: string; blocks?: Block[]; content?: Block[] };
type SafeTab = { id: string; title: string; _blocks: Block[] };

const props = withDefaults(
  defineProps<{
    tabs: Tab[];
    wrapperClass?: string;
    scrollOffset?: number;
  }>(),
  {
    wrapperClass: "mx-auto max-w-[1440px] px-6 py-12",
    scrollOffset: 140, // Ajuste para header sticky
  }
);

const route = useRoute();
const activeId = ref("");
const isClicking = ref(false);
let io: IntersectionObserver | null = null;

// --- LÓGICA DE DATOS ---
const safeTabs = computed<SafeTab[]>(() =>
  (props.tabs || [])
    .filter((t) => String(t?.title ?? "").trim())
    .map((t, i) => {
      const blocks = ((t.blocks ?? t.content ?? []) as Block[]).filter(Boolean);
      // Generar ID limpio (slug)
      const id =
        String(t.id ?? "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") || `tab-${i}`;
      return { id, title: String(t.title).trim(), _blocks: blocks };
    })
);

function isHtmlTextBlock(b: Block): b is TextBlock {
  return b.type === "text" && ((b as any).html === true || (b as any).format === "html");
}

// --- LÓGICA DE NAVEGACIÓN ---

// Actualiza la URL sin recargar (Mejora de ChatGPT)
function setHash(id: string) {
  if (typeof history !== "undefined") {
    history.replaceState(null, "", `#${id}`);
  }
}

function onClickTab(id: string) {
  isClicking.value = true;
  activeId.value = id;
  setHash(id);

  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - props.scrollOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Pequeño timeout para volver a activar el observer
    setTimeout(() => {
      isClicking.value = false;
    }, 800);
  }
}

// --- LIFECYCLE ---
onMounted(() => {
  if (!safeTabs.value.length) return;

  // 1. Inicializar activo por URL o el primero
  const hash = String(route.hash || "").replace(/^#/, "");
  activeId.value = safeTabs.value.some((t) => t.id === hash)
    ? hash
    : safeTabs.value[0].id;

  // Si hay hash inicial, scrollear ahí
  if (hash) {
    nextTick(() => onClickTab(hash));
  }

  // 2. Intersection Observer para detectar scroll
  io = new IntersectionObserver(
    (entries) => {
      if (isClicking.value) return;

      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // El que tenga mayor ratio de visibilidad gana
        const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best && best.target.id) {
          activeId.value = best.target.id;
          // Opcional: actualizar hash mientras scrolleas (a veces puede ser molesto, lo dejo comentado)
          // setHash(best.target.id)
        }
      }
    },
    {
      rootMargin: `-${props.scrollOffset}px 0px -40% 0px`,
      threshold: [0, 0.2, 0.5],
    }
  );

  safeTabs.value.forEach((t) => {
    const el = document.getElementById(t.id);
    if (el) io?.observe(el);
  });
});

onBeforeUnmount(() => {
  io?.disconnect();
});
</script>

<template>
  <section v-if="safeTabs.length" class="bg-slate-50 relative">
    <div
      class="sticky top-[80px] z-20 bg-slate-50/95 backdrop-blur shadow-sm border-b border-slate-200"
    >
      <div :class="wrapperClass" class="!py-0">
        <nav
          class="flex gap-8 overflow-x-auto no-scrollbar"
          aria-label="Secciones de producto"
        >
          <button
            v-for="t in safeTabs"
            :key="t.id"
            type="button"
            class="relative py-4 text-[15px] font-medium whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
            :class="
              activeId === t.id ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
            "
            @click="onClickTab(t.id)"
          >
            {{ t.title }}
            <span
              class="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full transition-transform duration-300 origin-center scale-x-0 bg-sky-700"
              :class="{ 'scale-x-100': activeId === t.id }"
            />
          </button>
        </nav>
      </div>
    </div>

    <div :class="wrapperClass">
      <div
        class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100"
      >
        <article
          v-for="t in safeTabs"
          :key="t.id"
          :id="t.id"
          class="px-8 py-10 md:px-12 md:py-12 scroll-mt-[150px]"
        >
          <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            {{ t.title }}
          </h2>

          <div class="space-y-6 text-slate-600 leading-relaxed">
            <template v-for="(b, bi) in t._blocks" :key="bi">
              <div
                v-if="isHtmlTextBlock(b)"
                class="prose prose-slate max-w-none"
                v-html="b.text"
              />
              <p v-else-if="b.type === 'text'" class="whitespace-pre-line text-lg">
                {{ (b as any).text }}
              </p>

              <ul v-else-if="b.type === 'bullets'" class="grid gap-3 sm:grid-cols-2">
                <li
                  v-for="(it, j) in (b as any).items || []"
                  :key="j"
                  class="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100"
                >
                  <svg
                    class="w-5 h-5 text-sky-600 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span class="text-sm font-medium text-slate-700">{{ it }}</span>
                </li>
              </ul>

              <figure v-else-if="b.type === 'image'" class="my-6">
                <NuxtImg
                  :src="(b as any).src"
                  :alt="(b as any).alt || ''"
                  :width="(b as any).width"
                  :height="(b as any).height"
                  class="rounded-xl border border-slate-100 w-full object-cover max-h-[500px]"
                  loading="lazy"
                  format="webp"
                  quality="80"
                />
                <figcaption
                  v-if="(b as any).caption"
                  class="text-center text-sm text-slate-400 mt-2"
                >
                  {{ (b as any).caption }}
                </figcaption>
              </figure>
            </template>

            <div
              v-if="!t._blocks.length"
              class="p-4 bg-slate-50 text-slate-400 rounded-lg text-center italic"
            >
              Información no disponible.
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
