<script setup lang="ts">
import { ChevronLeft, ChevronRight, Mail, Pencil, Phone } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { Corretor, FeedbackStatus } from '@/types/oferta-ativa'

interface Item {
  id: string
  c2sLeadId: string
  leadNome: string | null
  leadTelefone: string | null
  leadEmpreendimento: string | null
  resultado: FeedbackStatus | null
  observacao: string
  finalizadoEm: string | null
  corretorNome: string | null
  setorNome: string | null
}

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  'interessado': 'Interessado',
  'nao-interessado': 'Não interessado',
  'recontatar': 'Recontatar',
  'numero-invalido': 'Número inválido',
}
const STATUS_CLASS: Record<FeedbackStatus, string> = {
  'interessado': 'bg-emerald-100 text-emerald-700',
  'nao-interessado': 'bg-rose-100 text-rose-700',
  'recontatar': 'bg-amber-100 text-amber-700',
  'numero-invalido': 'bg-neutral-200 text-neutral-700',
}

const itens = ref<Item[]>([])
const isGerente = ref(false)
const corretores = ref<Corretor[]>([])
const loading = ref(false)
const page = ref(1)
const filtroStatus = ref<string>('todos')
const filtroCorretor = ref<string>('todos')

async function load() {
  loading.value = true
  try {
    const query: Record<string, any> = { page: page.value, perpage: 20 }
    if (filtroStatus.value !== 'todos')
      query.status = filtroStatus.value
    if (filtroCorretor.value !== 'todos')
      query.corretorId = filtroCorretor.value
    const res = await $fetch<{ itens: Item[], isGerente: boolean }>('/api/oferta-ativa/historico', { query })
    itens.value = res.itens
    isGerente.value = res.isGerente
    if (res.isGerente && !corretores.value.length)
      corretores.value = await $fetch<Corretor[]>('/api/oferta-ativa/corretores').catch(() => [])
  } finally {
    loading.value = false
  }
}

function aplicarFiltro() {
  page.value = 1
  load()
}
function irPara(p: number) {
  if (p < 1)
    return
  page.value = p
  load()
}

onMounted(load)

function fmtData(iso: string | null) {
  if (!iso)
    return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// --- edição ---
const editOpen = ref(false)
const editing = ref<Item | null>(null)
const editObs = ref('')
const editResultado = ref<FeedbackStatus>('interessado')
const salvando = ref(false)

function abrirEdicao(item: Item) {
  editing.value = item
  editObs.value = item.observacao ?? ''
  editResultado.value = item.resultado ?? 'interessado'
  editOpen.value = true
}
async function salvarEdicao() {
  if (!editing.value)
    return
  salvando.value = true
  try {
    await $fetch(`/api/oferta-ativa/atendimentos/${editing.value.id}`, {
      method: 'PATCH',
      body: { observacao: editObs.value, resultado: editResultado.value },
    })
    editing.value.observacao = editObs.value
    editing.value.resultado = editResultado.value
    editOpen.value = false
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="space-y-1.5">
        <Label>Resultado</Label>
        <Select v-model="filtroStatus" @update:model-value="aplicarFiltro">
          <SelectTrigger class="w-44">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">
              Todos
            </SelectItem>
            <SelectItem v-for="(label, value) in STATUS_LABEL" :key="value" :value="value">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="isGerente" class="space-y-1.5">
        <Label>Corretor</Label>
        <Select v-model="filtroCorretor" @update:model-value="aplicarFiltro">
          <SelectTrigger class="w-52">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">
              Todos
            </SelectItem>
            <SelectItem v-for="c in corretores" :key="c.id" :value="c.id">
              {{ c.nome }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Card v-if="loading" class="px-6 py-12 text-center text-sm text-muted-foreground">
      Carregando…
    </Card>

    <Card v-else-if="!itens.length" class="px-6 py-12 text-center text-sm text-muted-foreground">
      Nenhum atendimento registrado{{ filtroStatus || filtroCorretor ? ' com esses filtros' : '' }}.
    </Card>

    <div v-else class="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50">
            <TableHead class="font-semibold text-foreground">
              Lead
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Resultado
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Observação
            </TableHead>
            <TableHead v-if="isGerente" class="font-semibold text-foreground">
              Corretor
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Quando
            </TableHead>
            <TableHead class="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="it in itens" :key="it.id" class="hover:bg-muted/30">
            <TableCell>
              <p class="font-medium text-foreground">
                {{ it.leadNome || '—' }}
              </p>
              <span v-if="it.leadTelefone" class="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone class="size-3" />
                <a :href="`tel:${it.leadTelefone.replace(/\D/g, '')}`" class="hover:text-brand">{{ it.leadTelefone }}</a>
              </span>
              <span v-if="it.leadEmpreendimento" class="block truncate text-xs text-muted-foreground">{{ it.leadEmpreendimento }}</span>
            </TableCell>
            <TableCell>
              <Badge v-if="it.resultado" :class="`${STATUS_CLASS[it.resultado]} border-0`">
                {{ STATUS_LABEL[it.resultado] }}
              </Badge>
            </TableCell>
            <TableCell class="max-w-xs">
              <span class="line-clamp-2 text-sm text-muted-foreground">{{ it.observacao || '—' }}</span>
            </TableCell>
            <TableCell v-if="isGerente" class="text-sm text-muted-foreground">
              {{ it.corretorNome || '—' }}
            </TableCell>
            <TableCell class="whitespace-nowrap text-xs text-muted-foreground">
              {{ fmtData(it.finalizadoEm) }}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon-sm" aria-label="Editar" @click="abrirEdicao(it)">
                <Pencil class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-if="itens.length || page > 1" class="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" :disabled="page === 1" @click="irPara(page - 1)">
        <ChevronLeft class="size-4" /> Anterior
      </Button>
      <span class="text-sm text-muted-foreground">Página {{ page }}</span>
      <Button variant="outline" size="sm" :disabled="itens.length < 20" @click="irPara(page + 1)">
        Próxima <ChevronRight class="size-4" />
      </Button>
    </div>

    <Dialog v-model:open="editOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar atendimento</DialogTitle>
          <DialogDescription>{{ editing?.leadNome }} — atualize o resultado ou a observação.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="salvarEdicao">
          <div class="space-y-1.5">
            <Label>Resultado</Label>
            <Select v-model="editResultado">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(label, value) in STATUS_LABEL" :key="value" :value="value">
                  {{ label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label for="edit-obs">Observação</Label>
            <Textarea id="edit-obs" v-model="editObs" rows="4" />
          </div>
          <DialogFooter class="gap-2 sm:gap-2">
            <Button type="button" variant="outline" @click="editOpen = false">
              Cancelar
            </Button>
            <Button type="submit" :disabled="salvando">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
