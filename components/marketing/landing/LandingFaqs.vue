<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronUp, Plus } from "lucide-vue-next";

type FaqItem = {
  question: string;
  answer: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    items: FaqItem[];
    defaultOpen?: boolean;
    variant?: "default" | "calendar";
  }>(),
  {
    title: "Preguntas frecuentes",
    defaultOpen: true,
    variant: "default",
  }
);

const safeItems = computed(() =>
  Array.isArray(props.items)
    ? props.items.filter((item) => item?.question && item?.answer)
    : []
);

const openItems = ref<Set<number>>(
  new Set(props.defaultOpen ? safeItems.value.map((_, index) => index) : [])
);

function toggleItem(index: number) {
  const next = new Set(openItems.value);

  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }

  openItems.value = next;
}
</script>

<template>
  <section
    class="landing-faqs"
    :class="{ 'landing-faqs--calendar': props.variant === 'calendar' }"
    aria-labelledby="landing-faqs-title"
  >
    <div class="landing-faqs__inner">
      <h2 id="landing-faqs-title" class="landing-faqs__title section-title section-title--section">
        {{ title }}
      </h2>

      <div class="landing-faqs__list">
        <article
          v-for="(item, index) in safeItems"
          :key="item.question"
          class="landing-faqs__item"
          :class="{ 'is-open': openItems.has(index) }"
        >
          <button
            type="button"
            class="landing-faqs__trigger text-body"
            :aria-expanded="openItems.has(index)"
            :aria-controls="`landing-faq-answer-${index}`"
            @click="toggleItem(index)"
          >
            <span>{{ item.question }}</span>

            <Plus v-if="props.variant === 'calendar'" class="landing-faqs__icon" aria-hidden="true" />
            <ChevronUp v-else class="landing-faqs__icon" aria-hidden="true" />
          </button>

          <div
            v-show="openItems.has(index)"
            :id="`landing-faq-answer-${index}`"
            class="landing-faqs__content"
          >
            <p class="text-body">{{ item.answer }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
<style scoped>
.landing-faqs {
  width: 100%;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 86px 0 106px;
}

.landing-faqs__inner {
  width: min(100% - 40px, 828px);
  margin-inline: auto;
}

.landing-faqs__title {
  margin: 0;
  color: hsl(var(--foreground));
  text-align: center;
}

.landing-faqs__list {
  display: grid;
  gap: 34px;
  margin-top: 66px;
}

.landing-faqs__item {
  overflow: hidden;
  border: 1px solid hsl(var(--foreground) / 0.18);
  border-radius: 8px;
  background: hsl(var(--background));
  box-shadow: 0 10px 32px hsl(var(--foreground) / 0.08);
}

.landing-faqs__trigger {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 22px 13px;
  border: 0;
  border-bottom: 1px solid hsl(var(--foreground) / 0.35);
  background: transparent;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
}

.landing-faqs__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: hsl(var(--foreground));
  stroke-width: 1.8;
  transition: transform 180ms ease;
}

.landing-faqs__item:not(.is-open) .landing-faqs__icon {
  transform: rotate(180deg);
}

.landing-faqs__content {
  padding: 13px 22px 22px;
}

.landing-faqs__content p {
  margin: 0;
  color: hsl(var(--foreground));
}

.landing-faqs--calendar {
  padding-block: 68px 78px;
}

.landing-faqs--calendar .landing-faqs__inner {
  width: min(100% - 40px, 960px);
}

.landing-faqs--calendar .landing-faqs__list {
  gap: 0;
  margin-top: 38px;
  border-top: 1px solid hsl(var(--foreground) / 0.18);
}

.landing-faqs--calendar .landing-faqs__item {
  border: 0;
  border-bottom: 1px solid hsl(var(--foreground) / 0.18);
  border-radius: 0;
  box-shadow: none;
}

.landing-faqs--calendar .landing-faqs__trigger {
  min-height: 64px;
  padding: 18px 4px;
  border-bottom: 0;
}

.landing-faqs--calendar .landing-faqs__icon {
  width: 19px;
  height: 19px;
}

.landing-faqs--calendar .landing-faqs__content {
  padding: 0 40px 18px 4px;
}

@media (max-width: 767px) {
  .landing-faqs {
    padding: 64px 0 76px;
  }

  .landing-faqs__inner,
  .landing-faqs--calendar .landing-faqs__inner {
    width: min(100% - 32px, 828px);
  }

  .landing-faqs__list {
    gap: 20px;
    margin-top: 40px;
  }

  .landing-faqs__trigger {
    padding: 18px 18px 12px;
  }

  .landing-faqs__content {
    padding: 12px 18px 18px;
  }

  .landing-faqs--calendar {
    padding-block: 56px 64px;
  }

  .landing-faqs--calendar .landing-faqs__list {
    gap: 0;
    margin-top: 30px;
  }

  .landing-faqs--calendar .landing-faqs__trigger {
    padding: 16px 4px;
  }
}
</style>
