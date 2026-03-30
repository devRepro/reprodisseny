<script setup lang="ts">
  import ContentSectionIntro from "@/components/marketing/content/ContentSectionIntro.vue";
  
  const props = withDefaults(
    defineProps<{
      eyebrow?: string;
      title: string;
      description?: string;
      sectionClass?: string;
      containerClass?: string;
      contentClass?: string;
      introClass?: string;
      bodyClass?: string;
      headingTag?: "h1" | "h2" | "h3" | "h4";
      headingSize?: "hero" | "section" | "compact";
      line?: boolean;
    }>(),
    {
      eyebrow: "",
      description: "",
      sectionClass: "bg-background",
      containerClass: "container-content",
      contentClass: "mx-auto w-full max-w-4xl",
      introClass: "max-w-3xl",
      bodyClass: "mt-8",
      headingTag: "h2",
      headingSize: "section",
      line: false,
    }
  );
  </script>
  
  <template>
    <section :class="sectionClass">
      <div :class="containerClass" class="py-10 md:py-14">
        <div :class="contentClass">
          <div :class="introClass">
            <ContentSectionIntro
              :eyebrow="eyebrow"
              :title="title"
              :description="description"
              :heading-tag="headingTag"
              :heading-size="headingSize"
              :line="line"
            />
          </div>
  
          <div :class="bodyClass">
            <slot />
          </div>
        </div>
      </div>
    </section>
  </template>