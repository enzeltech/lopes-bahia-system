<script setup lang="ts">
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import ConfirmDeleteDialog from '@/components/configuracao/ConfirmDeleteDialog.vue'
import SetorFormModal from '@/components/oferta-ativa/SetorFormModal.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SetorFormPayload } from '@/composables/useSetoresAdmin'
import type { Setor } from '@/types/oferta-ativa'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const { setores, corretores, tagsC2s, loading, erro, load, create, update, remove } = useSetoresAdmin()

const formOpen = ref(false)
const editing = ref<Setor | null>(null)
const formRef = ref<InstanceType<typeof SetorFormModal> | null>(null)

const deleteOpen = ref(false)
const deleting = ref<Setor | null>(null)

onMounted(() => load())

function nomeCorretor(id: string) {
  return corretores.value.find(c => c.id === id)?.nome ?? '—'
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(setor: Setor) {
  editing.value = setor
  formOpen.value = true
}

function openDelete(setor: Setor) {
  deleting.value = setor
  deleteOpen.value = true
}

async function handleSubmit(payload: SetorFormPayload, id: string | null) {
  try {
    if (id)
      await update(id, payload)
    else
      await create(payload)
    formOpen.value = false
  } catch (e: any) {
    formRef.value?.setError(e?.statusMessage ?? 'Não foi possível salvar o setor.')
  }
}

async function confirmDelete() {
  if (deleting.value)
    await remove(deleting.value.id)
  deleteOpen.value = false
  deleting.value = null
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <NuxtLink
          to="/dashboard/configuracao"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
        >
          ← Configurações
        </NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Setores da Oferta Ativa
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ setores.length }} {{ setores.length === 1 ? 'setor ativo' : 'setores ativos' }}.
        </p>
      </div>

      <Button variant="default" size="sm" @click="openCreate">
        <Plus class="size-4" />
        Novo setor
      </Button>
    </header>

    <Card
      v-if="erro"
      class="border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ erro }}
    </Card>

    <Card v-if="!loading && setores.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <Briefcase class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum setor cadastrado
      </h2>
      <p class="text-sm text-muted-foreground">
        Crie o primeiro setor para distribuir os leads da C2S entre os corretores.
      </p>
      <Button class="mt-2" @click="openCreate">
        <Plus class="size-4" />
        Novo setor
      </Button>
    </Card>

    <div v-else-if="setores.length" class="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50">
            <TableHead class="font-semibold text-foreground">
              Setor
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Tags C2S
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Corretores
            </TableHead>
            <TableHead class="w-[120px] text-right font-semibold text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="s in setores" :key="s.id" class="hover:bg-muted/30">
            <TableCell>
              <div class="flex items-center gap-2.5">
                <span class="size-3 shrink-0 rounded-full" :style="{ backgroundColor: s.cor }" />
                <div class="min-w-0">
                  <p class="font-medium text-foreground">
                    {{ s.nome }}
                  </p>
                  <p v-if="s.descricao" class="truncate text-xs text-muted-foreground">
                    {{ s.descricao }}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge v-for="t in s.tagsC2s ?? []" :key="t" variant="secondary" class="text-xs">
                  {{ t }}
                </Badge>
                <span v-if="!(s.tagsC2s ?? []).length" class="text-xs text-muted-foreground">
                  Todos os leads
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ (s.corretores ?? []).length
                  ? (s.corretores ?? []).map(nomeCorretor).join(', ')
                  : 'Nenhum' }}
              </span>
            </TableCell>
            <TableCell class="text-right">
              <div class="inline-flex gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Editar" @click="openEdit(s)">
                  <Pencil class="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover"
                  class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  @click="openDelete(s)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <SetorFormModal
      ref="formRef"
      v-model:open="formOpen"
      :setor="editing"
      :corretores="corretores"
      :tags-disponiveis="tagsC2s"
      @submit="handleSubmit"
    />

    <ConfirmDeleteDialog
      v-model:open="deleteOpen"
      title="Remover setor"
      :description="`Tem certeza que deseja desativar ${deleting?.nome ?? 'este setor'}? O histórico de atendimentos é preservado.`"
      confirm-label="Remover"
      @confirm="confirmDelete"
    />
  </section>
</template>
