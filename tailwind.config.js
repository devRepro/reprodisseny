/** @type {import('tailwindcss').Config} */
export default {
    config: {
        content: [
          './components/**/*.{vue,js,ts}',
          './layouts/**/*.vue',
          './pages/**/*.vue',
          './plugins/**/*.{js,ts}',
          './nuxt.config.{js,ts}',
          './content/**/*.{md,yml,json,json5,csv}',
        ],
    viewer: true,
    theme: {
      extend: {
        colors: {
          primary: '#00629B', // ✅ CMYK 95/41/10/0 convertido a RGB
          secondary: '#000000', // ✅ Negro
          light: '#f8f9fa',
          dark: '#212529',
          gray: '#6c757d',
        }
      },
    },
    plugins: [],
  }
}
  