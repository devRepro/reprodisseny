<script setup lang="ts">
import { computed, ref } from "vue";
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
  }>(),
  {
    title: "Preguntas frecuentes",
    defaultOpen: true,
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
  <section class="landing-faqs" aria-labelledby="landing-faqs-title">
    <div class="landing-faqs__inner">
      <h2 id="landing-faqs-title" class="landing-faqs__title">
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
            class="landing-faqs__trigger"
            :aria-expanded="openItems.has(index)"
            :aria-controls="`landing-faq-answer-${index}`"
            @click="toggleItem(index)"
          >
            <span>{{ item.question }}</span>

            <ChevronUp class="landing-faqs__icon" aria-hidden="true" />
          </button>

          <div
            v-show="openItems.has(index)"
            :id="`landing-faq-answer-${index}`"
            class="landing-faqs__content"
          >
            <p>{{ item.answer }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
<style scoped>
.landing-faqs {
  width: 100%;
  background: #ffffff;
  color: #212121;
  padding: 86px 0 106px;
}

.landing-faqs__inner {
  width: min(100% - 40px, 828px);
  margin-inline: auto;
}

.landing-faqs__title {
  margin: 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: -0.02em;
  color: #212121;
}

.landing-faqs__list {
  display: grid;
  gap: 34px;
  margin-top: 66px;
}

.landing-faqs__item {
  overflow: hidden;
  border: 1px solid rgb(33 33 33 / 18%);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 32px rgb(0 0 0 / 8%);
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
  border-bottom: 1px solid rgb(33 33 33 / 35%);
  background: transparent;
  color: #212121;
  text-align: left;
  font-family: var(--font-sans);
  font-size: clamp(17px, 1.35vw, 20px);
  font-weight: 400;
  line-height: 1.25;
  cursor: pointer;
}

.landing-faqs__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: #212121;
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
  color: #212121;
  font-family: var(--font-sans);
  font-size: clamp(15px, 1.15vw, 17px);
  font-weight: 400;
  line-height: 1.42;
}

@media (max-width: 767px) {
  .landing-faqs {
    padding: 64px 0 76px;
  }

  .landing-faqs__inner {
    width: min(100% - 32px, 828px);
  }

  .landing-faqs__title {
    font-size: 30px;
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
}
</style>