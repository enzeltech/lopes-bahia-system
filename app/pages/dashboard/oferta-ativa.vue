<script setup lang="ts">
import { BarChart3, CheckCircle2, History, Inbox, Loader2, Phone, RefreshCcw } from 'lucide-vue-next'
import FeedbackForm from '@/components/oferta-ativa/FeedbackForm.vue'
import HistoricoPanel from '@/components/oferta-ativa/HistoricoPanel.vue'
import LeadCard from '@/components/oferta-ativa/LeadCard.vue'
import RelatoriosPanel from '@/components/oferta-ativa/RelatoriosPanel.vue'
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
  setorAtivo,
  currentLead,
  stats,
  semLeads,
  loadingSetores,
  loadingLead,
  enviando,
  erro,
  loadSetores,
  selectSetor,
  registrarFeedback,
} = useOfertaAtiva()

type Aba = 'trabalhar' | 'relatorios' | 'historico'
const aba = ref<Aba>('trabalhar')
const abas = [
  { value: 'trabalhar' as const, label: 'Trabalhar', icon: Phone },
  { value: 'relatorios' as const, label: 'Relatórios', icon: BarChart3 },
  { value: 'historico' as const, label: 'Histórico', icon: History },
]

const pickerOpen = ref(false)

onMounted(async () => {
  await loadSetores()
  if (aba.value === 'trabalhar' && !setorAtivo.value)
    pickerOpen.value = true
})

async function onSelectSetor(setor: Setor) {
  pickerOpen.value = false
  await selectSetor(setor.id)
}

function onChangeSetor() {
  pickerOpen.value = true
}

async function onSubmitFeedback(payload: { status: FeedbackStatus, observacao: string }) {
  await registrarFeedback(payload.status, payload.observacao)
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Oferta Ativa
        </h1>
        <p v-if="aba === 'trabalhar'" class="text-sm text-muted-foreground">
          <template v-if="setorAtivo">
            Trabalhando o <strong>{{ setorAtivo.nome }}</strong>.
          </template>
          <template v-else>
            Escolha um setor para iniciar.
          </template>
        </p>
        <p v-else-if="aba === 'relatorios'" class="text-sm text-muted-foreground">
          Produtividade e conversão.
        </p>
        <p v-else class="text-sm text-muted-foreground">
          Histórico de contatos registrados.
        </p>
      </div>

      <div v-if="aba === 'trabalhar' && setorAtivo" class="flex gap-2">
        <Button variant="default" size="sm" @click="onChangeSetor">
          Trocar setor
        </Button>
      </div>
    </header>

    <!-- Sub-abas -->
    <div class="flex gap-1 border-b border-border">
      <button
        v-for="t in abas"
        :key="t.value"
        type="button"
        class="-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors outline-none"
        :class="aba === t.value
          ? 'border-brand text-brand'
          : 'border-transparent text-muted-foreground hover:text-foreground'"
        @click="aba = t.value"
      >
        <component :is="t.icon" class="size-4" />
        {{ t.label }}
      </button>
    </div>

    <!-- TRABALHAR -->
    <template v-if="aba === 'trabalhar'">
      <Card
        v-if="erro"
        class="flex items-center justify-between gap-4 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        <span>{{ erro }}</span>
        <Button variant="outline" size="sm" @click="setorAtivo ? selectSetor(setorAtivo.id) : loadSetores()">
          <RefreshCcw class="size-4" />
          Tentar novamente
        </Button>
      </Card>

      <StatsBar v-if="setorAtivo" :stats="stats" />

      <Card
        v-if="loadingLead"
        class="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted-foreground"
      >
        <Loader2 class="size-7 animate-spin" />
        <p class="text-sm">
          Buscando próximo lead…
        </p>
      </Card>

      <template v-else-if="setorAtivo && currentLead">
        <LeadCard :lead="currentLead" />
        <FeedbackForm :disabled="enviando" @submit="onSubmitFeedback" />
      </template>

      <Card
        v-else-if="setorAtivo && semLeads"
        class="flex flex-col items-center gap-4 px-6 py-16 text-center"
      >
        <span class="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 class="size-7" />
        </span>
        <h2 class="text-base font-semibold text-foreground">
          Nenhum lead disponível
        </h2>
        <p class="max-w-sm text-sm text-muted-foreground">
          Não há leads novos para este setor no momento. Tente novamente mais tarde ou escolha outro setor.
        </p>
        <Button variant="default" size="sm" @click="onChangeSetor">
          Trocar setor
        </Button>
      </Card>

      <Card
        v-else-if="!setorAtivo"
        class="flex flex-col items-center gap-3 px-6 py-16 text-center"
      >
        <span class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
          <Inbox class="size-7" />
        </span>
        <h2 class="text-base font-semibold text-foreground">
          Nenhum setor selecionado
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="!loadingSetores && !setores.length">
            Você ainda não está atribuído a nenhum setor. Fale com um gestor.
          </template>
          <template v-else>
            Selecione um setor para começar a trabalhar os leads.
          </template>
        </p>
        <Button
          v-if="setores.length"
          class="mt-2"
          :disabled="loadingSetores"
          @click="pickerOpen = true"
        >
          <Loader2 v-if="loadingSetores" class="size-4 animate-spin" />
          Escolher setor
        </Button>
      </Card>

      <SetorPicker
        v-model:open="pickerOpen"
        :setores="setores"
        @select="onSelectSetor"
      />
    </template>

    <!-- RELATÓRIOS -->
    <RelatoriosPanel v-else-if="aba === 'relatorios'" />

    <!-- HISTÓRICO -->
    <HistoricoPanel v-else />
  </section>
</template>
