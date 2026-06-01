<script setup lang="ts">
import { BookOpen, Clock } from 'lucide-vue-next'
import AulaCard from '@/components/capacitacao/AulaCard.vue'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const route = useRoute()
const { loading, loaded, load, getTema } = useCapacitacao()
const progresso = useCapacitacaoProgresso()

const temaId = computed(() => String(route.params.tema))
const tema = computed(() => getTema(temaId.value))

onMounted(async () => {
  await Promise.all([load(), progresso.load()])
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <Card v-if="loading && !loaded" class="px-6 py-16 text-center text-sm text-muted-foreground">
      Carregando…
    </Card>

    <Card v-else-if="loaded && !tema" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h2 class="text-base font-semibold text-foreground">
        Tema não encontrado
      </h2>
      <NuxtLink to="/dashboard/capacitacao" class="text-sm font-medium text-brand hover:text-brand-hover">
        ← Voltar aos cursos
      </NuxtLink>
    </Card>

    <template v-else-if="tema">
      <header class="space-y-1">
        <NuxtLink
          to="/dashboard/capacitacao"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
        >
          ← Voltar aos cursos
        </NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {{ tema.nome }}
        </h1>
      </header>

      <div class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div class="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          <div
            class="flex h-40 w-full shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-hover md:w-64"
          >
            <BookOpen class="size-14 text-white/80" />
          </div>

          <div class="flex flex-1 flex-col gap-4">
            <p class="text-base leading-relaxed text-muted-foreground">
              {{ tema.descricao }}
            </p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <BookOpen class="size-4" />
                {{ tema.videos.length }} {{ tema.videos.length === 1 ? 'aula' : 'aulas' }}
              </span>
              <span class="flex items-center gap-1.5">
                <Clock class="size-4" />
                Autogerenciado
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 class="mb-5 text-xl font-bold text-foreground">
          Conteúdo do curso
        </h2>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AulaCard
            v-for="(video, index) in tema.videos"
            :key="video.id"
            :video="video"
            :index="index"
            :completed="progresso.isCompleted(video.id)"
          />
        </div>
      </div>
    </template>
  </section>
</template>
