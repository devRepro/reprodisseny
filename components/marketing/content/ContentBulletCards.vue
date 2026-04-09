<script setup lang="ts">
import { computed } from "vue";
import ContentSectionHeader from "@/components/marketing/content/ContentSectionHeader.vue";

type CardItemInput = {
  title?: string | null;
  description?: string | null;
};

type CardItem = {
  key: string;
  title: string;
  description: string;
};

const props = withDefaults(
  defineProps<{
    sectionId?: string;
    title: string;
    intro?: string;
    markdown?: string | null;
    items?: CardItemInput[];
    columns?: 2 | 3 | 4;
  }>(),
  {
    sectionId: undefined,
    intro: undefined,
    markdown: "",
    items: () => [],
    columns: 4,
  }
);

function stripMarkdown(value: string): string {
  return String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string, fallback = "item"): string {
  const normalized = stripMarkdown(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function parseBulletBlock(raw: string): Omit<CardItem, "key"> | null {
  const normalized = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;

  const boldTitleWithDesc = normalized.match(/^\*\*(.+?)\*\*\s*:\s*(.+)$/);
  if (boldTitleWithDesc) {
    return {
      title: stripMarkdown(boldTitleWithDesc[1]),
      description: stripMarkdown(boldTitleWithDesc[2]),
    };
  }

  const boldTitleOnly = normalized.match(/^\*\*(.+?)\*\*\s*$/);
  if (boldTitleOnly) {
    return {
      title: stripMarkdown(boldTitleOnly[1]),
      description: "",
    };
  }

  const plainTitleWithDesc = normalized.match(/^([^:]{1,140})\s*:\s*(.+)$/);
  if (plainTitleWithDesc) {
    return {
      title: stripMarkdown(plainTitleWithDesc[1]),
      description: stripMarkdown(plainTitleWithDesc[2]),
    };
  }

  return {
    title: "",
    description: stripMarkdown(normalized),
  };
}

function parseMarkdownCards(input: string | null | undefined): CardItem[] {
  const lines = String(input ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const blocks: string[] = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^[-*]\s+/.test(trimmed)) {
      if (current) blocks.push(current.trim());
      current = trimmed.replace(/^[-*]\s+/, "");
      continue;
    }

    current = current ? `${current} ${trimmed}` : trimmed;
  }

  if (current) blocks.push(current.trim());

  return blocks
    .map((block, index) => {
      const parsed = parseBulletBlock(block);
      if (!parsed) return null;

      const baseKey = parsed.title || parsed.description || `item-${index + 1}`;

      return {
        key: `${slugify(baseKey)}-${index + 1}`,
        title: parsed.title,
        description: parsed.description,
      };
    })
    .filter(Boolean) as CardItem[];
}

const normalizedItems = computed<CardItem[]>(() => {
  if (props.items?.length) {
    return props.items
      .map((item, index) => {
        const title = String(item?.title ?? "").trim();
        const description = String(item?.description ?? "").trim();

        if (!title && !description) return null;

        return {
          key: `${slugify(title || description || "item")}-${index + 1}`,
          title,
          description,
        };
      })
      .filter(Boolean) as CardItem[];
  }

  return parseMarkdownCards(props.markdown);
});

const hasContent = computed(() => normalizedItems.value.length > 0);

const gridClass = computed(() => {
  switch (props.columns) {
    case 2:
      return "grid grid-cols-1 gap-4 md:grid-cols-2";
    case 3:
      return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";
    case 4:
    default:
      return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";
  }
});
</script>

<template>
  <section
    v-if="hasContent"
    :id="sectionId"
    class="scroll-mt-32 space-y-8 md:space-y-10"
  >
    <div class="max-w-3xl">
      <ContentSectionHeader
        :title="title"
        :subtitle="intro"
        as="h2"
      />
    </div>

    <div :class="gridClass">
      <article
        v-for="item in normalizedItems"
        :key="item.key"
        class="h-full rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20"
      >
        <div class="flex h-full flex-col gap-3">
          <h3
            v-if="item.title"
            class="text-base font-semibold leading-6 text-foreground md:text-lg"
          >
            {{ item.title }}
          </h3>

          <p
            v-if="item.description"
            class="text-sm leading-6 text-muted-foreground md:text-[15px]"
          >
            {{ item.description }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>