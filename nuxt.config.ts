// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  experimental: {
    appManifest: false,
  },
  modules: ["nitro-cloudflare-dev", "@pinia/nuxt", "nuxt-auth-utils"],
  vite: {
    worker: {
      format: "es",
    },
  },
})
