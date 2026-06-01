<script setup lang="ts">
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import LessonNotes from '@/components/capacitacao/LessonNotes.vue'
import LessonPlayer from '@/components/capacitacao/LessonPlayer.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const route = useRoute()
const { loading, loaded, load, getTema, getVideo, getNextVideo } = useCapacitacao()

const temaId = computed(() => String(route.params.tema))
const videoId = computed(() => String(route.params.video))

const tema = computed(() => getTema(temaId.value))
const video = computed(() => getVideo(temaId.value, videoId.value))
const nextVideo = computed(() => getNextVideo(temaId.value, videoId.value))

onMounted(() => load())

const { note, completed, setNote, markCompleted } = useLessonProgress(videoId)

const noteModel = computed({
  get: () => note.value,
  set: (v: string) => setNote(v),
})

async function handleNext() {
  if (nextVideo.value)
    await navigateTo(`/dashboard/capacitacao/${temaId.value}/${nextVideo.value.id}`)
  else
    await navigateTo(`/dashboard/capacitacao/${temaId.value}`)
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <Card v-if="loading && !loaded" class="px-6 py-16 text-center text-sm text-muted-foreground">
      Carregando aula…
    </Card>

    <Card v-else-if="loaded && (!tema || !video)" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h2 class="text-base font-semibold text-foreground">
        Aula não encontrada
      </h2>
      <NuxtLink to="/dashboard/capacitacao" class="text-sm font-medium text-brand hover:text-brand-hover">
        ← Voltar aos cursos
      </NuxtLink>
    </Card>

    <template v-else-if="video && tema">
      <header class="space-y-1">
        <NuxtLink
          :to="`/dashboard/capacitacao/${tema.id}`"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
        >
          ← {{ tema.nome }}
        </NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {{ video.titulo }}
        </h1>
        <p v-if="video.descricao" class="text-sm text-muted-foreground">
          {{ video.descricao }}
        </p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="flex flex-col gap-5 lg:col-span-2">
          <LessonPlayer :youtube-id="video.youtubeId" :title="video.titulo" />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <Button
              :variant="completed ? 'secondary' : 'default'"
              size="pill-lg"
              :disabled="completed"
              @click="markCompleted"
            >
              <CheckCircle2 class="size-4" />
              {{ completed ? 'Aula concluída' : 'Marcar como concluída' }}
            </Button>

            <Button variant="outline" size="pill-lg" @click="handleNext">
              {{ nextVideo ? 'Próxima aula' : 'Voltar ao curso' }}
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </div>

        <div class="lg:col-span-1">
          <LessonNotes v-model="noteModel" />
        </div>
      </div>
    </template>
  </section>
</template>
