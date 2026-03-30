<script setup lang="ts">
    import { cn } from "@/lib/utils";
    import SectionHeading from "@/components/marketing/content/SectionHeading.vue";
    
    const props = withDefaults(
      defineProps<{
        title: string;
        as?: "h2" | "h3" | "h4";
        class?: string;
        titleClass?: string;
        tone?: "brand" | "ink" | "foreground" | "white";
      }>(),
      {
        as: "h3",
        class: "",
        titleClass: "",
        tone: "foreground",
      }
    );
    </script>
    
    <template>
      <SectionHeading
        :as="props.as"
        :title="props.title"
        size="compact"
        :title-tone="props.tone"
        :line="false"
        :class="cn('w-full', props.class)"
        :title-class="cn('mb-0', props.titleClass)"
      />
    </template>