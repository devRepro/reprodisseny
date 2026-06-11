<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronUp } from "lucide-vue-next";

type FaqItem = {
  question: string;
  answer: string;
};

const props = withDefaults(
  defineProps<{
    title?: string;
    items: FaqItem[];
    defaultOpen?: boolean;
    showTitle?: boolean;
  }>(),
  {
    title: "FAQS",
    defaultOpen: true,
    showTitle: false,
  }
);

const safeItems = computed(() =>
  Array.isArray(props.items)
    ? props.items.filter((item) => item?.question?.trim() && item?.answer?.trim())
    : []
);

const openItems = ref<Set<number>>(new Set());

function resetOpenItems() {
  openItems.value = new Set(
    props.defaultOpen ? safeItems.value.map((_, index) => index) : []
  );
}

watch(safeItems, resetOpenItems, { immediate: true });

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
  <section class="education-faqs" aria-labelledby="education-faqs-title">
    <div class="education-faqs__inner">
      <h2
        v-if="showTitle"
        id="education-faqs-title"
        class="education-faqs__title"
      >
        {{ title }}
      </h2>

      <div class="education-faqs__list" role="list">
        <article
          v-for="(item, index) in safeItems"
          :key="item.question"
          class="education-faqs__item"
          :class="{ 'is-open': openItems.has(index) }"
          role="listitem"
        >
          <button
            type="button"
            class="education-faqs__trigger"
            :aria-expanded="openItems.has(index)"
            :aria-controls="`education-faq-answer-${index}`"
            @click="toggleItem(index)"
          >
            <span class="education-faqs__question">{{ item.question }}</span>
            <ChevronUp class="education-faqs__icon" aria-hidden="true" />
          </button>

          <div
            v-show="openItems.has(index)"
            :id="`education-faq-answer-${index}`"
            class="education-faqs__content"
          >
            <p>{{ item.answer }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.education-faqs {
  width: 100%;
  background: transparent;
  color: hsl(var(--brand-ink-dark));
  padding: 0;
}

.education-faqs__inner {
  width: min(100% - 48px, 920px);
  margin-inline: auto;
}

.education-faqs__title {
  margin: 0 0 56px;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: var(--font-h1);
  font-weight: var(--weight-h1);
  line-height: var(--line-h1);
  letter-spacing: 0;
  text-align: center;
}

.education-faqs__list {
  display: grid;
  gap: 28px;
  margin: 0;
  padding: 0;
}

.education-faqs__item {
  overflow: hidden;
  border: 1px solid hsl(var(--brand-ink-dark) / 0.16);
  border-radius: var(--radius);
  background: hsl(var(--brand-white));
  box-shadow: 0 10px 30px hsl(var(--brand-ink-dark) / 0.08);
}

.education-faqs__trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px;
  column-gap: 24px;
  width: 100%;
  min-height: 64px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid hsl(var(--brand-ink-dark) / 0.24);
  background: transparent;
  padding: 20px 28px 18px;
  color: hsl(var(--brand-ink-dark));
  text-align: left;
  cursor: pointer;
}

.education-faqs__question {
  display: block;
  min-width: 0;
  color: hsl(var(--brand-ink-dark));
  font-family: var(--font-sans);
  font-size: var(--font-h4);
  font-weight: var(--weight-h4);
  line-height: var(--line-h4);
  letter-spacing: 0;
}

.education-faqs__icon {
  width: 18px;
  height: 18px;
  justify-self: end;
  color: hsl(var(--brand-ink-dark));
  stroke-width: 1.8;
  transition: transform 180ms ease;
}

.education-faqs__item:not(.is-open) .education-faqs__icon {
  transform: rotate(180deg);
}

.education-faqs__item:not(.is-open) .education-faqs__trigger {
  border-bottom-color: transparent;
}

.education-faqs__content {
  padding: 18px 28px 24px;
}

.education-faqs__content p {
  margin: 0;
  color: hsl(var(--brand-ink-medium));
  font-family: var(--font-sans);
  font-size: var(--font-body);
  font-weight: var(--weight-body);
  line-height: var(--line-body);
  letter-spacing: 0;
}

@media (max-width: 1023px) {
  .education-faqs__inner {
    width: min(100% - 48px, 900px);
  }

  .education-faqs__list {
    gap: 24px;
  }
}

@media (max-width: 767px) {
  .education-faqs__inner {
    width: min(100% - 32px, 560px);
  }

  .education-faqs__title {
    margin-bottom: 36px;
    font-size: var(--font-h2);
    font-weight: var(--weight-h2);
    line-height: var(--line-h2);
  }

  .education-faqs__list {
    gap: 18px;
  }

  .education-faqs__item {
    border-radius: var(--radius);
    box-shadow: 0 8px 22px hsl(var(--brand-ink-dark) / 0.08);
  }

  .education-faqs__trigger {
    grid-template-columns: minmax(0, 1fr) 18px;
    min-height: 56px;
    column-gap: 16px;
    padding: 17px 20px 15px;
  }

  .education-faqs__question {
    font-size: var(--font-body);
    font-weight: var(--weight-body-bold);
    line-height: var(--line-body);
  }

  .education-faqs__icon {
    width: 18px;
    height: 18px;
  }

  .education-faqs__content {
    padding: 14px 20px 18px;
  }

  .education-faqs__content p {
    font-size: var(--font-body-s);
    line-height: var(--line-body-s);
  }
}
</style>
