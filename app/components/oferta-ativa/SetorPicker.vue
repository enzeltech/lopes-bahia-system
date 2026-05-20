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
    <DialogContent
      class="sm:max-w-lg [&>button.absolute]:hidden"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <DialogHeader>
        <DialogTitle class="text-xl">
          Escolher setor
        </DialogTitle>
        <DialogDescription>
          Selecione o setor com o qual você vai trabalhar nesta sessão.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="setor in setores"
          :key="setor.id"
          type="button"
          class="group flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-all outline-none hover:border-brand/40 hover:bg-muted/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          @click="pick(setor)"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/15"
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
    </DialogContent>
  </Dialog>
</template>
