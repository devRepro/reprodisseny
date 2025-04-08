// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './content/**/*.{md,yml,json,json5,csv}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        light: 'hsl(var(--color-light) / <alpha-value>)',
        dark: 'hsl(var(--color-dark) / <alpha-value>)',
        gray: 'hsl(var(--color-gray) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}

export default config
