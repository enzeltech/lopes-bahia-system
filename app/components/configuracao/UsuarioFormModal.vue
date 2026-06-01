<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildUsuarioSchema, cpfDigits } from '@/lib/schemas/usuario'
import { maskCPF } from '@/lib/format'
import { CARGO_LABEL, CARGOS } from '@/types/usuario'
import type { UsuarioConfig, UsuarioFormPayload } from '@/types/usuario'

const props = defineProps<{
  open: boolean
  usuario?: UsuarioConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', payload: UsuarioFormPayload, originalId: string | null): void
}>()

const isEditing = computed(() => !!props.usuario)
const originalId = ref<string | null>(null)
const submitError = ref<string | null>(null)

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const { handleSubmit, defineField, errors, resetForm, setFieldValue } = useForm({
  validationSchema: computed(() => toTypedSchema(buildUsuarioSchema({ requireSenha: !isEditing.value }))),
  initialValues: { nome: '', cpf: '', cargo: 'operacional', email: '', senha: '' },
})

const [nome, nomeAttrs] = defineField('nome')
const [cpf, cpfAttrs] = defineField('cpf')
const [cargo, cargoAttrs] = defineField('cargo')
const [email, emailAttrs] = defineField('email')
const [senha, senhaAttrs] = defineField('senha')

watch(
  () => props.open,
  (open) => {
    submitError.value = null
    if (!open)
      return
    if (props.usuario) {
      originalId.value = props.usuario.id
      resetForm({
        values: {
          nome: props.usuario.nome,
          cpf: maskCPF(props.usuario.cpf),
          cargo: props.usuario.cargo,
          email: props.usuario.email ?? '',
          senha: '',
        },
      })
    } else {
      originalId.value = null
      resetForm({ values: { nome: '', cpf: '', cargo: 'operacional', email: '', senha: '' } })
    }
  },
  { immediate: true },
)

function onCpfInput(event: Event) {
  const target = event.target as HTMLInputElement
  setFieldValue('cpf', maskCPF(target.value))
}

const onSubmit = handleSubmit((values) => {
  submitError.value = null
  const cpfRaw = cpfDigits(values.cpf)
  emit('submit', {
    cpf: cpfRaw,
    nome: values.nome.trim(),
    cargo: values.cargo,
    email: values.email ? values.email.trim() : undefined,
    senha: values.senha || undefined,
  }, originalId.value)
})

function setError(message: string) {
  submitError.value = message
}

defineExpose({ setError })
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Editar usuário' : 'Novo usuário' }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Atualize os dados deste usuário.' : 'Cadastre um novo usuário no sistema.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <div class="space-y-1.5">
          <Label for="usuario-nome">Nome</Label>
          <Input
            id="usuario-nome"
            v-model="nome"
            v-bind="nomeAttrs"
            type="text"
            placeholder="Nome completo"
          />
          <p v-if="errors.nome" class="text-xs text-destructive">
            {{ errors.nome }}
          </p>
        </div>

        <div class="space-y-1.5">
          <Label for="usuario-cpf">CPF</Label>
          <Input
            id="usuario-cpf"
            v-model="cpf"
            v-bind="cpfAttrs"
            type="text"
            inputmode="numeric"
            placeholder="000.000.000-00"
            @input="onCpfInput"
          />
          <p v-if="errors.cpf" class="text-xs text-destructive">
            {{ errors.cpf }}
          </p>
        </div>

        <div class="space-y-1.5">
          <Label for="usuario-cargo">Cargo</Label>
          <Select v-model="cargo" v-bind="cargoAttrs">
            <SelectTrigger id="usuario-cargo">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CARGOS" :key="c" :value="c">
                {{ CARGO_LABEL[c] }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.cargo" class="text-xs text-destructive">
            {{ errors.cargo }}
          </p>
        </div>

        <div class="space-y-1.5">
          <Label for="usuario-email">Email</Label>
          <Input
            id="usuario-email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="email@lopesbahia.com.br"
          />
          <p v-if="errors.email" class="text-xs text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <div v-if="!isEditing" class="space-y-1.5">
          <Label for="usuario-senha">Senha</Label>
          <Input
            id="usuario-senha"
            v-model="senha"
            v-bind="senhaAttrs"
            type="password"
            placeholder="Mínimo 4 caracteres"
          />
          <p v-if="errors.senha" class="text-xs text-destructive">
            {{ errors.senha }}
          </p>
        </div>

        <p v-if="submitError" class="text-sm text-destructive">
          {{ submitError }}
        </p>

        <DialogFooter class="gap-2 sm:gap-2">
          <Button type="button" variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            {{ isEditing ? 'Salvar alterações' : 'Cadastrar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
