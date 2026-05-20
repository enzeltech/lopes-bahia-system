<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EmpreendimentoFiltros } from '@/types/empreendimento'

const props = defineProps<{
  nomes: string[]
  bairros: string[]
  tipos: string[]
  estagios: string[]
}>()

const emit = defineEmits<{
  (e: 'search', filtros: EmpreendimentoFiltros): void
  (e: 'reset'): void
}>()

const ALL = '__all__'

const nome = ref<string>(ALL)
const bairro = ref<string>(ALL)
const tipo = ref<string>(ALL)
const estagio = ref<string>(ALL)

function buildFiltros(): EmpreendimentoFiltros {
  return {
    nome: nome.value === ALL ? '' : nome.value,
    bairro: bairro.value === ALL ? '' : bairro.value,
    tipo: tipo.value === ALL ? '' : tipo.value,
    estagio: estagio.value === ALL ? '' : estagio.value,
  }
}

function onSubmit() {
  emit('search', buildFiltros())
}

function onReset() {
  nome.value = ALL
  bairro.value = ALL
  tipo.value = ALL
  estagio.value = ALL
  emit('reset')
}

interface FieldDef {
  id: 'nome' | 'bairro' | 'tipo' | 'estagio'
  label: string
  model: Ref<string>
  options: ComputedRef<string[]>
}

const fields: FieldDef[] = [
  { id: 'nome', label: 'Nome do empreendimento', model: nome, options: computed(() => props.nomes) },
  { id: 'bairro', label: 'Bairro', model: bairro, options: computed(() => props.bairros) },
  { id: 'tipo', label: 'Tipo de imóvel', model: tipo, options: computed(() => props.tipos) },
  { id: 'estagio', label: 'Estágio', model: estagio, options: computed(() => props.estagios) },
]
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div v-for="field in fields" :key="field.id" class="space-y-1.5">
        <Label :for="field.id" class="text-sm font-medium text-foreground">
          {{ field.label }}
        </Label>
        <Select v-model="field.model.value">
          <SelectTrigger :id="field.id">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL">
              Todos
            </SelectItem>
            <SelectItem v-for="opt in field.options.value" :key="opt" :value="opt">
              {{ opt }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button type="button" variant="outline" @click="onReset">
        <RotateCcw class="size-4" />
        Limpar
      </Button>
      <Button type="submit" variant="default">
        <Search class="size-4" />
        Buscar
      </Button>
    </div>
  </form>
</template>
