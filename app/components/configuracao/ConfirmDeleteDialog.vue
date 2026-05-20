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

const props = defineProps<{
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

function confirm() {
  emit('confirm')
}
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title ?? 'Confirmar' }}</DialogTitle>
        <DialogDescription>
          {{ description ?? 'Tem certeza?' }}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="gap-2 sm:gap-2">
        <Button type="button" variant="outline" @click="openModel = false">
          {{ cancelLabel ?? 'Cancelar' }}
        </Button>
        <Button type="button" variant="destructive" @click="confirm">
          {{ confirmLabel ?? 'Remover' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
