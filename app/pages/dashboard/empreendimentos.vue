<script setup lang="ts">
import { Building2, Download, FileText, SearchX } from 'lucide-vue-next'
import ResultsTable from '@/components/empreendimentos/ResultsTable.vue'
import SearchForm from '@/components/empreendimentos/SearchForm.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { exportarCsv, exportarPdf } from '@/lib/export-empreendimentos'
import type { Empreendimento, EmpreendimentoFiltros } from '@/types/empreendimento'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const { options, search, load } = useEmpreendimentos()

const loading = ref(false)
const hasSearched = ref(false)
const resultados = ref<Empreendimento[]>([])

onMounted(() => load())

async function handleSearch(filtros: EmpreendimentoFiltros) {
  loading.value = true
  hasSearched.value = true
  resultados.value = search(filtros)
  loading.value = false
}

function handleReset() {
  hasSearched.value = false
  resultados.value = []
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Empreendimentos
      </h1>
      <p class="text-sm text-muted-foreground">
        Use os filtros para encontrar empreendimentos disponíveis.
      </p>
    </header>

    <Card class="p-6">
      <SearchForm
        :nomes="options.nomes"
        :bairros="options.bairros"
        :tipos="options.tipos"
        :estagios="options.estagios"
        @search="handleSearch"
        @reset="handleReset"
      />
    </Card>

    <Card v-if="loading" class="flex items-center justify-center px-6 py-16 text-sm text-muted-foreground">
      Buscando empreendimentos...
    </Card>

    <Card
      v-else-if="hasSearched && resultados.length === 0"
      class="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Nenhum resultado
      </h2>
      <p class="text-sm text-muted-foreground">
        Ajuste os filtros e tente novamente.
      </p>
    </Card>

    <Card v-else-if="resultados.length > 0" class="p-6">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-foreground">
            Resultado da consulta
          </h2>
          <span class="text-sm text-muted-foreground">
            {{ resultados.length }} {{ resultados.length === 1 ? 'empreendimento' : 'empreendimentos' }}
          </span>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="exportarCsv(resultados)">
            <Download class="size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" @click="exportarPdf(resultados)">
            <FileText class="size-4" />
            PDF
          </Button>
        </div>
      </div>
      <ResultsTable :empreendimentos="resultados" />
    </Card>

    <Card
      v-else
      class="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <span class="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Building2 class="size-7" />
      </span>
      <h2 class="text-base font-semibold text-foreground">
        Comece uma busca
      </h2>
      <p class="text-sm text-muted-foreground">
        Selecione um ou mais filtros acima e clique em <strong>Buscar</strong>.
      </p>
    </Card>
  </section>
</template>
