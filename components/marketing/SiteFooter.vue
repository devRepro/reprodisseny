<script setup lang="ts">
import { Linkedin, Instagram } from "lucide-vue-next";

type Social = { kind: "linkedin" | "instagram"; href: string };

withDefaults(defineProps<{ socials?: Social[] }>(), {
  socials: () => [
    { kind: "linkedin", href: "https://www.linkedin.com" },
    { kind: "instagram", href: "https://www.instagram.com" },
  ],
});

function SocialIcon(props: { kind: "linkedin" | "instagram" }) {
  return props.kind === "linkedin" ? Linkedin : Instagram;
}
</script>

<template>
  <div class="flex gap-3 pt-2">
    <a
      v-for="s in socials"
      :key="s.href"
      :href="s.href"
      class="text-white/70 hover:text-white"
      target="_blank"
      rel="noreferrer"
      :aria-label="s.kind"
    >
      <component
        :is="s.kind === 'linkedin' ? Linkedin : Instagram"
        class="h-4 w-4"
        :stroke-width="1.5"
      />
    </a>
  </div>
</template>
