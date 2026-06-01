<script setup lang="ts">
import { Briefcase } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Setor } from '@/types/oferta-ativa'

const props = defineProps<{
  open: boolean
  setores: Setor[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', setor: Setor): void
}>()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

function pick(setor: Setor) {
  emit('select', setor)
}
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="text-xl">
          Escolher setor
        </DialogTitle>
        <DialogDescription>
          Selecione o setor com o qual você vai trabalhar nesta sessão.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="setores.length"
        class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <button
          v-for="setor in setores"
          :key="setor.id"
          type="button"
          class="group flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-all outline-none hover:border-brand/40 hover:bg-muted/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          @click="pick(setor)"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full text-white transition-transform group-hover:scale-105"
            :style="{ backgroundColor: setor.cor || '#eb194b' }"
          >
            <Briefcase class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
              {{ setor.nome }}
            </span>
            <span v-if="setor.descricao" class="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
              {{ setor.descricao }}
            </span>
          </span>
        </button>
      </div>

      <div
        v-else
        class="mt-2 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center"
      >
        <span class="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Briefcase class="size-6" />
        </span>
        <p class="text-sm font-medium text-foreground">
          Nenhum setor disponível
        </p>
        <p class="max-w-xs text-xs text-muted-foreground">
          Você ainda não está atribuído a um setor. Um gestor pode criar e atribuir setores em
          <strong>Configurações → Setores da Oferta Ativa</strong>.
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
