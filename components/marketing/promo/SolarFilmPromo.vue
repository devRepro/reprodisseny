<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "#imports";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import SolarFilmPromoContent from "@/components/marketing/promo/SolarFilmPromoContent.vue";

const route = useRoute();

const PROMO_DISMISSED_KEY = "rd:solar-film-promo:dismissed-at";
const PROMO_SESSION_KEY = "rd:solar-film-promo:shown-session";

const DISMISS_DAYS = 7;
const DESKTOP_DELAY_MS = 9000;
const MOBILE_DELAY_MS = 12000;
const DESKTOP_SCROLL_RATIO = 0.35;
const MOBILE_SCROLL_RATIO = 0.42;

const mounted = ref(false);
const open = ref(false);
const isMobile = ref(false);
const hasTrackedView = ref(false);

let timerId: number | null = null;
let mediaQuery: MediaQueryList | null = null;
let removeMediaListener: (() => void) | null = null;
let closeReason: "cta" | "dismiss" | null = null;

const excludedRoutePrefixes = [
  "/lp/laminas-solares",
  "/gracias",
  "/admin",
  "/panel",
  "/api",
];

const isEligibleRoute = computed(() => {
  const path = route.path || "/";

  return !excludedRoutePrefixes.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });
});

function getNow() {
  return Date.now();
}

function readStorage(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can fail in some private browsing contexts. The promo should still work.
  }
}

function getDismissedAt() {
  if (!import.meta.client) return 0;

  const raw = readStorage(window.localStorage, PROMO_DISMISSED_KEY);
  const value = Number(raw);

  return Number.isFinite(value) ? value : 0;
}

function hasRecentDismissal() {
  const dismissedAt = getDismissedAt();
  if (!dismissedAt) return false;

  const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000;

  return getNow() - dismissedAt < maxAge;
}

function hasShownThisSession() {
  if (!import.meta.client) return true;

  return readStorage(window.sessionStorage, PROMO_SESSION_KEY) === "1";
}

function markShownThisSession() {
  if (!import.meta.client) return;

  writeStorage(window.sessionStorage, PROMO_SESSION_KEY, "1");
}

function markDismissed() {
  if (!import.meta.client) return;

  writeStorage(window.localStorage, PROMO_DISMISSED_KEY, String(getNow()));
}

function getScrollRatio() {
  if (!import.meta.client) return 0;

  const documentElement = document.documentElement;
  const maxScroll = documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) return 0;

  return window.scrollY / maxScroll;
}

function hasMeaningfulMobileScroll() {
  if (!import.meta.client) return false;

  return window.scrollY > 240 || getScrollRatio() > 0.12;
}

function shouldSkipPromo() {
  return !isEligibleRoute.value || hasRecentDismissal() || hasShownThisSession();
}

function trackPromo(event: string, payload: Record<string, unknown> = {}) {
  if (!import.meta.client) return;

  const win = window as unknown as {
    dataLayer?: Array<Record<string, unknown>>;
  };

  win.dataLayer = win.dataLayer || [];

  win.dataLayer.push({
    event,
    promo_name: "solar_film_landing",
    promo_location: isMobile.value ? "mobile_drawer" : "desktop_sheet",
    page_path: route.path,
    ...payload,
  });
}

function openPromo(trigger: "delay" | "scroll") {
  if (!import.meta.client) return;
  if (open.value || shouldSkipPromo()) return;

  open.value = true;
  markShownThisSession();

  if (!hasTrackedView.value) {
    hasTrackedView.value = true;
    trackPromo("promo_solar_film_view", {
      promo_trigger: trigger,
    });
  }

  clearTriggers();
}

function handleScroll() {
  const ratio = getScrollRatio();
  const threshold = isMobile.value ? MOBILE_SCROLL_RATIO : DESKTOP_SCROLL_RATIO;

  if (ratio >= threshold) {
    openPromo("scroll");
  }
}

function handleDelayedOpen() {
  if (isMobile.value && !hasMeaningfulMobileScroll()) {
    return;
  }

  openPromo("delay");
}

function clearTriggers() {
  if (!import.meta.client) return;

  if (timerId) {
    window.clearTimeout(timerId);
    timerId = null;
  }

  window.removeEventListener("scroll", handleScroll);
}

function setupTriggers() {
  if (!import.meta.client) return;

  clearTriggers();

  if (shouldSkipPromo()) return;

  const delay = isMobile.value ? MOBILE_DELAY_MS : DESKTOP_DELAY_MS;

  timerId = window.setTimeout(handleDelayedOpen, delay);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

function handleOpenChange(value: boolean) {
  const wasOpen = open.value;

  open.value = value;

  if (!value && wasOpen) {
    markDismissed();

    if (closeReason !== "cta") {
      trackPromo("promo_solar_film_dismiss");
    }

    closeReason = null;
  }
}

function handleDismiss() {
  closeReason = "dismiss";
  handleOpenChange(false);
}

function handleLandingClick() {
  closeReason = "cta";
  markDismissed();

  trackPromo("promo_solar_film_click", {
    promo_cta: "landing",
  });

  open.value = false;
}

function handleQuoteClick() {
  closeReason = "cta";
  markDismissed();

  trackPromo("promo_solar_film_click", {
    promo_cta: "quote_form",
  });

  open.value = false;
}

function updateViewportState() {
  if (!import.meta.client) return;

  isMobile.value = window.matchMedia("(max-width: 767px)").matches;
}

onMounted(() => {
  mounted.value = true;

  mediaQuery = window.matchMedia("(max-width: 767px)");
  isMobile.value = mediaQuery.matches;

  const handleMediaChange = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches;
    setupTriggers();
  };

  mediaQuery.addEventListener("change", handleMediaChange);
  removeMediaListener = () => {
    mediaQuery?.removeEventListener("change", handleMediaChange);
  };

  updateViewportState();

  nextTick(() => {
    setupTriggers();
  });
});

onBeforeUnmount(() => {
  clearTriggers();
  removeMediaListener?.();
});

watch(
  () => route.fullPath,
  async () => {
    open.value = false;
    closeReason = null;
    hasTrackedView.value = false;
    clearTriggers();

    await nextTick();

    setupTriggers();
  }
);
</script>

<template>
  <ClientOnly>
    <Sheet
      v-if="mounted && !isMobile && isEligibleRoute"
      :open="open"
      @update:open="handleOpenChange"
    >
      <SheetContent
        side="right"
        class="w-[min(94vw,440px)] border-transparent bg-transparent p-3 shadow-none sm:p-5"
      >
        <SheetHeader class="sr-only">
          <SheetTitle>Promoción de láminas solares</SheetTitle>
          <SheetDescription>
            Información destacada sobre láminas solares para reducir calor y reflejos.
          </SheetDescription>
        </SheetHeader>

        <SolarFilmPromoContent
          variant="desktop"
          @landing="handleLandingClick"
          @quote="handleQuoteClick"
          @dismiss="handleDismiss"
        />
      </SheetContent>
    </Sheet>

    <Drawer
      v-else-if="mounted && isMobile && isEligibleRoute"
      :open="open"
      @update:open="handleOpenChange"
    >
      <DrawerContent class="max-h-[66dvh] overflow-hidden border-border/70 bg-background p-0 shadow-2xl">
        <DrawerHeader class="sr-only">
          <DrawerTitle>Promoción de láminas solares</DrawerTitle>
          <DrawerDescription>
            Información destacada sobre láminas solares para reducir calor y reflejos.
          </DrawerDescription>
        </DrawerHeader>

        <SolarFilmPromoContent
          variant="mobile"
          @landing="handleLandingClick"
          @quote="handleQuoteClick"
          @dismiss="handleDismiss"
        />
      </DrawerContent>
    </Drawer>
  </ClientOnly>
</template>
