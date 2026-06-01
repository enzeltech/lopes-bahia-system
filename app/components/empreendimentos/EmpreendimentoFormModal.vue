<script setup lang="ts">
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
import type { Empreendimento } from '@/types/empreendimento'

const props = defineProps<{
  open: boolean
  empreendimento?: Empreendimento | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', payload: Partial<Empreendimento>, id: string | null): void
}>()

const isEditing = computed(() => !!props.empreendimento)
const submitError = ref<string | null>(null)

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

function vazio(): Partial<Empreendimento> {
  return {
    nome: '',
    tipo: '',
    dormitorios: 0,
    suites: 0,
    vagas: 0,
    areaM2: 0,
    estagio: '',
    dataEntrega: '',
    endereco: '',
    bairro: '',
    incorporador: '',
    coordenador: '',
  }
}

const form = ref<Partial<Empreendimento>>(vazio())

watch(
  () => props.open,
  (open) => {
    submitError.value = null
    if (!open)
      return
    form.value = props.empreendimento ? { ...props.empreendimento } : vazio()
  },
  { immediate: true },
)

function onSubmit() {
  if (!form.value.nome?.trim()) {
    submitError.value = 'Informe o nome.'
    return
  }
  emit('submit', { ...form.value }, props.empreendimento?.id ?? null)
}

function setError(message: string) {
  submitError.value = message
}

defineExpose({ setError })

const textos = [
  ['nome', 'Nome'],
  ['tipo', 'Tipo'],
  ['estagio', 'Estágio'],
  ['dataEntrega', 'Entrega'],
  ['endereco', 'Endereço'],
  ['bairro', 'Bairro'],
  ['incorporador', 'Incorporador'],
  ['coordenador', 'Coordenador'],
] as const

const numeros = [
  ['dormitorios', 'Dorms'],
  ['suites', 'Suítes'],
  ['vagas', 'Vagas'],
  ['areaM2', 'Área (m²)'],
] as const
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Editar empreendimento' : 'Novo empreendimento' }}</DialogTitle>
        <DialogDescription>Dados do catálogo de empreendimentos.</DialogDescription>
      </DialogHeader>

      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" novalidate @submit.prevent="onSubmit">
        <div v-for="[campo, rotulo] in textos" :key="campo" class="space-y-1.5" :class="campo === 'nome' || campo === 'endereco' ? 'sm:col-span-2' : ''">
          <Label :for="`emp-${campo}`">{{ rotulo }}</Label>
          <Input :id="`emp-${campo}`" v-model="(form as any)[campo]" type="text" />
        </div>

        <div v-for="[campo, rotulo] in numeros" :key="campo" class="space-y-1.5">
          <Label :for="`emp-${campo}`">{{ rotulo }}</Label>
          <Input :id="`emp-${campo}`" v-model.number="(form as any)[campo]" type="number" min="0" />
        </div>

        <p v-if="submitError" class="text-sm text-destructive sm:col-span-2">
          {{ submitError }}
        </p>

        <DialogFooter class="gap-2 sm:col-span-2 sm:gap-2">
          <Button type="button" variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            {{ isEditing ? 'Salvar alterações' : 'Criar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
