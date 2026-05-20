<script setup lang="ts">
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import LessonNotes from '@/components/capacitacao/LessonNotes.vue'
import LessonPlayer from '@/components/capacitacao/LessonPlayer.vue'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'dashboard-section',
  middleware: 'auth',
})

const route = useRoute()
const { getTema, getVideo, getNextVideo } = useCapacitacao()

const temaId = computed(() => String(route.params.tema))
const videoId = computed(() => String(route.params.video))

const tema = computed(() => getTema(temaId.value))
const video = computed(() => getVideo(temaId.value, videoId.value))
const nextVideo = computed(() => getNextVideo(temaId.value, videoId.value))

if (!tema.value || !video.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Aula não encontrada',
    fatal: true,
  })
}

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
  <section v-if="video && tema" class="flex flex-col gap-6">
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
  </section>
</template>
