<script setup lang="ts">
type Props = {
  title: string;
  description?: string;
  as?: "h1" | "h2";
  size?: "default" | "compact";
};

const props = withDefaults(defineProps<Props>(), {
  description: "",
  as: "h1",
  size: "default",
});
</script>

<template>
  <section class="page-header">
    <div class="page-header__bg" aria-hidden="true">
      <div class="page-header__glow page-header__glow--left" />
      <div class="page-header__glow page-header__glow--right" />
      <div class="page-header__mesh" />
    </div>

    <div
      class="container-wide page-header__content flex flex-col items-center justify-center text-center"
      :class="
        props.size === 'compact'
          ? 'min-h-[168px] gap-4 py-10 md:min-h-[184px] md:py-12'
          : 'min-h-[196px] gap-5 py-12 md:min-h-[220px] md:gap-6 md:py-14'
      "
    >
      <component
        :is="props.as"
        class="max-w-3xl text-balance font-semibold tracking-tight text-brand-base-dark"
        :class="
          props.size === 'compact'
            ? 'text-[28px] leading-[1.15] md:text-[32px]'
            : 'text-[30px] leading-[1.12] md:text-[38px]'
        "
      >
        {{ props.title }}
      </component>

      <p
        v-if="props.description"
        class="max-w-2xl whitespace-pre-line text-pretty text-[16px] leading-7 text-brand-base-dark/90"
      >
        {{ props.description }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid hsl(var(--border) / 0.45);
  background: linear-gradient(
    180deg,
    hsl(var(--brand-base-light)) 0%,
    hsl(var(--brand-base-light) / 0.96) 58%,
    hsl(var(--background)) 140%
  );
  box-shadow: inset 0 -1px 0 hsl(var(--foreground) / 0.03),
    inset 0 -24px 40px -36px hsl(var(--brand-base-dark) / 0.18);
}

.page-header__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.page-header__content {
  position: relative;
  z-index: 1;
}

.page-header__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(50px);
  opacity: 0.55;
}

.page-header__glow--left {
  top: -48px;
  left: -40px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, hsl(var(--brand-base) / 0.12) 0%, transparent 72%);
}

.page-header__glow--right {
  right: -60px;
  top: 16px;
  width: 340px;
  height: 340px;
  background: radial-gradient(
    circle,
    hsl(var(--primary-foreground) / 0.65) 0%,
    transparent 70%
  );
}

.page-header__mesh {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background: linear-gradient(
    135deg,
    transparent 0%,
    hsl(var(--brand-base-dark) / 0.035) 50%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.18) 45%,
    transparent 100%
  );
}
</style>
