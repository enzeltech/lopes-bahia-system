<script setup lang="ts">
import { Pencil, Plus, RotateCcw, Trash2, UserRound } from 'lucide-vue-next'
import ConfirmDeleteDialog from '@/components/configuracao/ConfirmDeleteDialog.vue'
import UsuarioFormModal from '@/components/configuracao/UsuarioFormModal.vue'
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
import { maskCPF } from '@/lib/format'
import { CARGO_LABEL } from '@/types/usuario'
import type { Cargo, UsuarioConfig, UsuarioFormPayload } from '@/types/usuario'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const { usuarios, hydrate, existsByCpf, add, update, remove, resetToMock } = useUsuariosConfig()

const formOpen = ref(false)
const editingUser = ref<UsuarioConfig | null>(null)
const formRef = ref<InstanceType<typeof UsuarioFormModal> | null>(null)

const deleteOpen = ref(false)
const deletingUser = ref<UsuarioConfig | null>(null)

onMounted(() => hydrate())

const cargoBadgeClass: Record<Cargo, string> = {
  super_admin: 'bg-brand/10 text-brand',
  diretor: 'bg-purple-100 text-purple-700',
  gerente: 'bg-blue-100 text-blue-700',
  corretor: 'bg-emerald-100 text-emerald-700',
  operacional: 'bg-neutral-200 text-neutral-700',
}

function openCreate() {
  editingUser.value = null
  formOpen.value = true
}

function openEdit(user: UsuarioConfig) {
  editingUser.value = user
  formOpen.value = true
}

function openDelete(user: UsuarioConfig) {
  deletingUser.value = user
  deleteOpen.value = true
}

function handleSubmit(payload: UsuarioFormPayload, originalCpf: string | null) {
  if (originalCpf) {
    if (payload.cpf !== originalCpf && existsByCpf(payload.cpf)) {
      formRef.value?.setError('Já existe um usuário com esse CPF.')
      return
    }
    update(originalCpf, payload)
  } else {
    if (existsByCpf(payload.cpf)) {
      formRef.value?.setError('Já existe um usuário com esse CPF.')
      return
    }
    add(payload)
  }
  formOpen.value = false
}

function confirmDelete() {
  if (deletingUser.value)
    remove(deletingUser.value.cpf)
  deleteOpen.value = false
  deletingUser.value = null
}

function onReset() {
  if (typeof window !== 'undefined' && !window.confirm('Restaurar a lista de usuários para o mock inicial?'))
    return
  resetToMock()
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
          Gerenciar usuários
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ usuarios.length }} {{ usuarios.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados' }}.
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="onReset">
          <RotateCcw class="size-4" />
          Restaurar mock
        </Button>
        <Button variant="default" size="sm" @click="openCreate">
          <Plus class="size-4" />
          Novo usuário
        </Button>
      </div>
    </header>

    <Card v-if="usuarios.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <UserRound class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum usuário cadastrado
      </h2>
      <p class="text-sm text-muted-foreground">
        Comece cadastrando o primeiro usuário do sistema.
      </p>
      <Button class="mt-2" @click="openCreate">
        <Plus class="size-4" />
        Novo usuário
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
              CPF
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Cargo
            </TableHead>
            <TableHead class="font-semibold text-foreground">
              Email
            </TableHead>
            <TableHead class="w-[160px] text-right font-semibold text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="u in usuarios" :key="u.cpf" class="hover:bg-muted/30">
            <TableCell class="font-medium text-foreground">
              {{ u.nome }}
            </TableCell>
            <TableCell class="tabular-nums text-muted-foreground">
              {{ maskCPF(u.cpf) }}
            </TableCell>
            <TableCell>
              <Badge :class="`${cargoBadgeClass[u.cargo]} border-0`">
                {{ CARGO_LABEL[u.cargo] }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ u.email || '—' }}
            </TableCell>
            <TableCell class="text-right">
              <div class="inline-flex gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Editar" @click="openEdit(u)">
                  <Pencil class="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover"
                  class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  @click="openDelete(u)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <UsuarioFormModal
      ref="formRef"
      v-model:open="formOpen"
      :usuario="editingUser"
      @submit="handleSubmit"
    />

    <ConfirmDeleteDialog
      v-model:open="deleteOpen"
      title="Remover usuário"
      :description="`Tem certeza que deseja remover ${deletingUser?.nome ?? 'este usuário'}? Esta ação não pode ser desfeita.`"
      confirm-label="Remover"
      @confirm="confirmDelete"
    />
  </section>
</template>
