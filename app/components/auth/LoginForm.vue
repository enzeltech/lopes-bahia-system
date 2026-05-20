<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maskCPF, unmask } from '@/lib/format'
import { loginSchema } from '@/lib/schemas/login'
import type { LoginCredentials } from '@/types/auth'

const emit = defineEmits<{
  (e: 'submit', payload: LoginCredentials): void | Promise<void>
}>()

const props = defineProps<{
  loading?: boolean
  serverError?: string | null
}>()

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { cpf: '', senha: '' },
})

const [cpf, cpfAttrs] = defineField('cpf')
const [senha, senhaAttrs] = defineField('senha')

function onCpfInput(event: Event) {
  const target = event.target as HTMLInputElement
  const masked = maskCPF(target.value)
  setFieldValue('cpf', masked)
}

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    cpf: unmask(values.cpf),
    senha: values.senha,
  })
})
</script>

<template>
  <form class="w-full space-y-5" novalidate @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <Label for="cpf" class="sr-only">CPF</Label>
      <Input
        id="cpf"
        v-model="cpf"
        v-bind="cpfAttrs"
        type="text"
        inputmode="numeric"
        autocomplete="username"
        placeholder="CPF"
        variant="pill"
        :aria-invalid="!!errors.cpf"
        @input="onCpfInput"
      />
      <p v-if="errors.cpf" class="px-2 text-xs text-destructive">
        {{ errors.cpf }}
      </p>
    </div>

    <div class="space-y-1.5">
      <Label for="senha" class="sr-only">Senha</Label>
      <Input
        id="senha"
        v-model="senha"
        v-bind="senhaAttrs"
        type="password"
        autocomplete="current-password"
        placeholder="Senha"
        variant="pill"
        :aria-invalid="!!errors.senha"
      />
      <p v-if="errors.senha" class="px-2 text-xs text-destructive">
        {{ errors.senha }}
      </p>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <p
        v-if="props.serverError"
        class="text-center text-sm text-destructive"
        role="alert"
      >
        {{ props.serverError }}
      </p>
    </Transition>

    <div class="flex justify-center pt-2">
      <Button
        type="submit"
        size="pill-lg"
        :disabled="props.loading"
        class="min-w-[140px]"
      >
        <Loader2 v-if="props.loading" class="animate-spin" />
        <span>{{ props.loading ? 'Entrando...' : 'Entrar' }}</span>
      </Button>
    </div>
  </form>
</template>
