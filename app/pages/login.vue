<script setup lang="ts">
import AuthHero from '@/components/auth/AuthHero.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import type { LoginCredentials } from '@/types/auth'

definePageMeta({ layout: 'auth' })

const loading = ref(false)
const serverError = ref<string | null>(null)

async function handleLogin(_credentials: LoginCredentials) {
  serverError.value = null
  loading.value = true

  try {
    // TODO: wire backend once API is defined
    await new Promise(resolve => setTimeout(resolve, 600))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    class="grid h-[600px] w-full max-w-[1140px] grid-cols-1 overflow-hidden bg-transparent md:grid-cols-2"
  >
    <div class="hidden h-full md:block">
      <AuthHero />
    </div>

    <div class="flex h-full items-center justify-center px-6 py-10 md:px-12">
      <div
        class="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <header class="flex flex-col items-center gap-4 text-center">
          <LopesLogo tone="brand" class="h-20 w-32" />
          <div class="space-y-3">
            <h1 class="text-3xl font-bold text-brand">Efetuar Login</h1>
            <p class="text-base text-neutral-600">
              Entre com seus dados abaixo.<br>
              Os campos são obrigatórios.
            </p>
          </div>
        </header>

        <LoginForm
          :loading="loading"
          :server-error="serverError"
          @submit="handleLogin"
        />
      </div>
    </div>
  </section>
</template>
