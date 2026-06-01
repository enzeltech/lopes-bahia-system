import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['shadcn-nuxt', 'nuxt-auth-utils'],

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

  runtimeConfig: {
    // Server-only secrets — populated from NUXT_* env vars
    c2sToken: '',
    c2sBaseUrl: '',
    // DEV: quando 'true', a fila usa leads de exemplo (a fila real da C2S está
    // vazia). Nunca habilitar em produção.
    c2sMockLeads: '',
    // Segredo opcional do webhook: se definido, a C2S deve enviá-lo em
    // ?secret= ou no header x-webhook-secret para o POST ser aceito.
    c2sWebhookSecret: '',
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
