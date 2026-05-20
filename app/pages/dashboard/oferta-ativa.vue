<script setup lang="ts">
import { CheckCircle2, Inbox, RefreshCcw } from 'lucide-vue-next'
import FeedbackForm from '@/components/oferta-ativa/FeedbackForm.vue'
import LeadCard from '@/components/oferta-ativa/LeadCard.vue'
import SetorPicker from '@/components/oferta-ativa/SetorPicker.vue'
import StatsBar from '@/components/oferta-ativa/StatsBar.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { FeedbackStatus, Setor } from '@/types/oferta-ativa'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const {
  setores,
  hydrate,
  proximoLead,
  registrarFeedback,
  estatisticas,
  totalDoSetor,
  resetSetor,
} = useOfertaAtiva()

const setorAtivo = ref<Setor | null>(null)
const pickerOpen = ref(true)

onMounted(() => {
  hydrate()
})

const currentLead = computed(() =>
  setorAtivo.value ? proximoLead(setorAtivo.value.id) : null,
)

const stats = computed(() =>
  setorAtivo.value
    ? estatisticas(setorAtivo.value.id)
    : { trabalhados: 0, interessados: 0, naoInteressados: 0, recontatar: 0, numerosInvalidos: 0 },
)

const total = computed(() => setorAtivo.value ? totalDoSetor(setorAtivo.value.id) : 0)

function onSelectSetor(setor: Setor) {
  setorAtivo.value = setor
  pickerOpen.value = false
}

function onChangeSetor() {
  pickerOpen.value = true
}

function onSubmitFeedback(payload: { status: FeedbackStatus, observacao: string }) {
  if (!currentLead.value)
    return
  registrarFeedback(currentLead.value.id, payload.status, payload.observacao)
}

function onResetSetor() {
  if (!setorAtivo.value)
    return
  if (typeof window !== 'undefined' && !window.confirm('Reiniciar o progresso deste setor?'))
    return
  resetSetor(setorAtivo.value.id)
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Oferta Ativa
        </h1>
        <p class="text-sm text-muted-foreground">
          <template v-if="setorAtivo">
            Trabalhando o <strong>{{ setorAtivo.nome }}</strong>.
          </template>
          <template v-else>
            Escolha um setor para iniciar.
          </template>
        </p>
      </div>

      <div v-if="setorAtivo" class="flex gap-2">
        <Button variant="outline" size="sm" @click="onResetSetor">
          <RefreshCcw class="size-4" />
          Reiniciar setor
        </Button>
        <Button variant="default" size="sm" @click="onChangeSetor">
          Trocar setor
        </Button>
      </div>
    </header>

    <StatsBar v-if="setorAtivo" :stats="stats" :total="total" />

    <template v-if="setorAtivo && currentLead">
      <LeadCard :lead="currentLead" />
      <FeedbackForm @submit="onSubmitFeedback" />
    </template>

    <Card
      v-else-if="setorAtivo && !currentLead"
      class="flex flex-col items-center gap-4 px-6 py-16 text-center"
    >
      <span class="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Setor concluído!
      </h2>
      <p class="max-w-sm text-sm text-muted-foreground">
        Você trabalhou todos os {{ total }} leads deste setor. Escolha outro setor ou reinicie para refazer.
      </p>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="onResetSetor">
          <RefreshCcw class="size-4" />
          Reiniciar setor
        </Button>
        <Button variant="default" size="sm" @click="onChangeSetor">
          Trocar setor
        </Button>
      </div>
    </Card>

    <Card
      v-else
      class="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <span class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Inbox class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum setor selecionado
      </h2>
      <p class="text-sm text-muted-foreground">
        Selecione um setor para começar a trabalhar os leads.
      </p>
      <Button class="mt-2" @click="pickerOpen = true">
        Escolher setor
      </Button>
    </Card>

    <SetorPicker
      v-model:open="pickerOpen"
      :setores="setores"
      @select="onSelectSetor"
    />
  </section>
</template>
