<script setup lang="ts">
import { Building2, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import ConfirmDeleteDialog from '@/components/configuracao/ConfirmDeleteDialog.vue'
import EmpreendimentoFormModal from '@/components/empreendimentos/EmpreendimentoFormModal.vue'
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
import type { Empreendimento } from '@/types/empreendimento'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const { empreendimentos, loading, erro, load, create, update, remove } = useEmpreendimentos()

const formOpen = ref(false)
const editing = ref<Empreendimento | null>(null)
const formRef = ref<InstanceType<typeof EmpreendimentoFormModal> | null>(null)

const deleteOpen = ref(false)
const deleting = ref<Empreendimento | null>(null)

onMounted(() => load())

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(e: Empreendimento) {
  editing.value = e
  formOpen.value = true
}

function openDelete(e: Empreendimento) {
  deleting.value = e
  deleteOpen.value = true
}

async function handleSubmit(payload: Partial<Empreendimento>, id: string | null) {
  try {
    if (id)
      await update(id, payload)
    else
      await create(payload)
    formOpen.value = false
  } catch (e: any) {
    formRef.value?.setError(e?.statusMessage ?? 'Não foi possível salvar.')
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
          Gerenciar empreendimentos
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ empreendimentos.length }} {{ empreendimentos.length === 1 ? 'empreendimento' : 'empreendimentos' }} no catálogo.
        </p>
      </div>
      <Button variant="default" size="sm" @click="openCreate">
        <Plus class="size-4" />
        Novo empreendimento
      </Button>
    </header>

    <Card v-if="erro" class="border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ erro }}
    </Card>

    <Card v-if="loading" class="px-6 py-16 text-center text-sm text-muted-foreground">
      Carregando…
    </Card>

    <Card v-else-if="empreendimentos.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <Building2 class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum empreendimento
      </h2>
      <Button class="mt-2" @click="openCreate">
        <Plus class="size-4" />
        Novo empreendimento
      </Button>
    </Card>

    <div v-else class="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50">
            <TableHead class="font-semibold text-foreground">
              Nome
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Bairro
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Tipo
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Estágio
            </TableHead>
            <TableHead class="w-[120px] text-right font-semibold text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="e in empreendimentos" :key="e.id" class="hover:bg-muted/30">
            <TableCell class="font-medium text-foreground">
              {{ e.nome }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ e.bairro || '—' }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ e.tipo || '—' }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ e.estagio || '—' }}
            </TableCell>
            <TableCell class="text-right">
              <div class="inline-flex gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Editar" @click="openEdit(e)">
                  <Pencil class="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover"
                  class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  @click="openDelete(e)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <EmpreendimentoFormModal
      ref="formRef"
      v-model:open="formOpen"
      :empreendimento="editing"
      @submit="handleSubmit"
    />

    <ConfirmDeleteDialog
      v-model:open="deleteOpen"
      title="Remover empreendimento"
      :description="`Remover ${deleting?.nome ?? 'este empreendimento'}? Esta ação não pode ser desfeita.`"
      confirm-label="Remover"
      @confirm="confirmDelete"
    />
  </section>
</template>
