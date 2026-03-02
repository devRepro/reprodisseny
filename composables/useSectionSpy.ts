// composables/useSectionSpy.ts
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, type ComputedRef } from "vue"
import { useRoute } from "#imports"

export function useSectionSpy(args: {
  ids: ComputedRef<string[]>
  scrollOffset: ComputedRef<number>
}) {
  const route = useRoute()

  const activeId = ref("")
  const isClicking = ref(false)
  const revealed = ref<Record<string, boolean>>({})

  let sectionIO: IntersectionObserver | null = null
  let revealIO: IntersectionObserver | null = null

  function setHash(id: string) {
    if (typeof history !== "undefined") history.replaceState(null, "", `#${id}`)
  }

  function scrollToId(id: string, smooth = true) {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - args.scrollOffset.value
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" })
  }

  function onClickNav(id: string, ev?: MouseEvent) {
    ev?.preventDefault()
    isClicking.value = true
    activeId.value = id
    setHash(id)
    scrollToId(id, true)
    window.setTimeout(() => (isClicking.value = false), 650)
  }

  const activeIndex = computed(() => args.ids.value.findIndex((id) => id === activeId.value))
  const progress = computed(() => {
    const n = args.ids.value.length
    if (n <= 1) return 1
    const idx = Math.max(0, activeIndex.value)
    return idx / (n - 1)
  })

  function cleanup() {
    sectionIO?.disconnect()
    revealIO?.disconnect()
    sectionIO = null
    revealIO = null
  }

  function setupObservers() {
    cleanup()

    // Scrollspy
    sectionIO = new IntersectionObserver(
      (entries) => {
        if (isClicking.value) return
        const visible = entries.filter((e) => e.isIntersecting)
        if (!visible.length) return
        const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (best?.target?.id) activeId.value = best.target.id
      },
      {
        root: null,
        rootMargin: `-${args.scrollOffset.value}px 0px -55% 0px`,
        threshold: [0.1, 0.25, 0.5],
      }
    )

    // Reveal
    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement)?.id
          if (!id) return
          if (e.isIntersecting) revealed.value[id] = true
        })
      },
      { root: null, rootMargin: "0px 0px -20% 0px", threshold: [0.05, 0.15] }
    )

    args.ids.value.forEach((id) => {
      const el = document.getElementById(id)
      if (el) {
        sectionIO?.observe(el)
        revealIO?.observe(el)
      }
    })
  }

  onMounted(async () => {
    if (!args.ids.value.length) return

    const hash = String(route.hash || "").replace(/^#/, "")
    activeId.value = args.ids.value.includes(hash) ? hash : args.ids.value[0]

    await nextTick()

    // si vienes con hash
    if (hash && args.ids.value.includes(hash)) {
      isClicking.value = true
      scrollToId(hash, false)
      window.setTimeout(() => (isClicking.value = false), 250)
    }

    setupObservers()

    const onResize = () => setupObservers()
    window.addEventListener("resize", onResize, { passive: true })

    onBeforeUnmount(() => window.removeEventListener("resize", onResize))
  })

  // si cambia el hash (back/forward o links externos)
  watch(
    () => route.hash,
    async (h) => {
      const id = String(h || "").replace(/^#/, "")
      if (!id || !args.ids.value.includes(id)) return
      await nextTick()
      isClicking.value = true
      activeId.value = id
      scrollToId(id, false)
      window.setTimeout(() => (isClicking.value = false), 250)
    }
  )

  watch(
    () => args.ids.value.join("|"),
    async () => {
      await nextTick()
      setupObservers()
      if (!args.ids.value.includes(activeId.value)) activeId.value = args.ids.value[0] || ""
    }
  )

  watch(
    () => args.scrollOffset.value,
    () => setupObservers()
  )

  onBeforeUnmount(() => cleanup())

  return { activeId, revealed, activeIndex, progress, onClickNav }
}