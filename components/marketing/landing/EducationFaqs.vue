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
  color: #212121;
  padding: 0;
}

.education-faqs__inner {
  width: min(100% - 96px, 1320px);
  margin-inline: auto;
}

.education-faqs__title {
  margin: 0 0 56px;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
}

.education-faqs__list {
  display: grid;
  gap: 54px;
  margin: 0;
  padding: 0;
}

.education-faqs__item {
  overflow: hidden;
  border: 1px solid rgb(30 30 30 / 0.95);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 0 rgb(0 0 0 / 0.22);
}

.education-faqs__trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px;
  column-gap: 24px;
  width: 100%;
  min-height: 55px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid rgb(30 30 30 / 0.42);
  background: transparent;
  padding: 23px 31px 13px;
  color: #212121;
  text-align: left;
  cursor: pointer;
}

.education-faqs__question {
  display: block;
  min-width: 0;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: 0;
}

.education-faqs__icon {
  width: 16px;
  height: 16px;
  justify-self: end;
  color: #212121;
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
  padding: 15px 31px 29px;
}

.education-faqs__content p {
  margin: 0;
  color: #212121;
  font-family: Figtree, var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0;
}

@media (max-width: 1023px) {
  .education-faqs__inner {
    width: min(100% - 48px, 900px);
  }

  .education-faqs__list {
    gap: 32px;
  }
}

@media (max-width: 767px) {
  .education-faqs__inner {
    width: min(100% - 32px, 560px);
  }

  .education-faqs__title {
    margin-bottom: 36px;
    font-size: 28px;
  }

  .education-faqs__list {
    gap: 22px;
  }

  .education-faqs__item {
    border-radius: 12px;
    box-shadow: 0 5px 0 rgb(0 0 0 / 0.18);
  }

  .education-faqs__trigger {
    grid-template-columns: minmax(0, 1fr) 18px;
    min-height: 58px;
    column-gap: 16px;
    padding: 18px 18px 13px;
  }

  .education-faqs__question {
    font-size: 18px;
    line-height: 1.3;
  }

  .education-faqs__icon {
    width: 18px;
    height: 18px;
  }

  .education-faqs__content {
    padding: 14px 18px 18px;
  }

  .education-faqs__content p {
    font-size: 16px;
    line-height: 1.4;
  }
}
</style>
