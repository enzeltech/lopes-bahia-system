import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['shadcn-nuxt'],

  components: [
    { path: '~/components', pathPrefix: false, ignore: ['**/ui/**'] },
  ],

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: 'Ui',
    componentDir: './app/components/ui',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Lopes Bahia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
