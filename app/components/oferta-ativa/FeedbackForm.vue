<script setup lang="ts">
import type { Component } from 'vue'
import { CheckCircle2, PhoneOff, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { FeedbackStatus } from '@/types/oferta-ativa'

const props = withDefaults(defineProps<{ disabled?: boolean }>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: { status: FeedbackStatus, observacao: string }): void
}>()

interface StatusOption {
  value: FeedbackStatus
  label: string
  icon: Component
  activeClass: string
}

const options: StatusOption[] = [
  { value: 'interessado', label: 'Interessado', icon: ThumbsUp, activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'nao-interessado', label: 'Não interessado', icon: ThumbsDown, activeClass: 'border-rose-500 bg-rose-50 text-rose-700' },
  { value: 'recontatar', label: 'Recontatar', icon: CheckCircle2, activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'numero-invalido', label: 'Número inválido', icon: PhoneOff, activeClass: 'border-neutral-500 bg-neutral-100 text-neutral-700' },
]

const status = ref<FeedbackStatus | null>(null)
const observacao = ref('')

const submitDisabled = computed(() => !status.value || props.disabled)

function onSubmit() {
  if (!status.value)
    return
  emit('submit', { status: status.value, observacao: observacao.value.trim() })
  status.value = null
  observacao.value = ''
}
</script>

<template>
  <Card class="p-6">
    <form class="space-y-5" @submit.prevent="onSubmit">
      <header class="space-y-1">
        <h3 class="text-base font-semibold text-foreground">
          Registrar feedback
        </h3>
        <p class="text-sm text-muted-foreground">
          Como foi o contato com este lead?
        </p>
      </header>

      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :class="
            cn(
              'flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
              status === opt.value
                ? opt.activeClass
                : 'border-border bg-background text-muted-foreground hover:border-brand/30 hover:bg-muted/40',
            )
          "
          @click="status = opt.value"
        >
          <component :is="opt.icon" class="size-5" />
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <div class="space-y-1.5">
        <Label for="observacao">Observação (opcional)</Label>
        <Textarea
          id="observacao"
          v-model="observacao"
          placeholder="Detalhes da conversa, próximos passos…"
          rows="4"
        />
      </div>

      <div class="flex justify-end">
        <Button type="submit" size="pill-lg" :disabled="submitDisabled">
          Salvar e ir para o próximo
        </Button>
      </div>
    </form>
  </Card>
</template>
