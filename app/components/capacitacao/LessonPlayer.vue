<script setup lang="ts">
import { youtubeEmbedUrl } from '@/lib/youtube'

const props = defineProps<{
  youtubeId: string
  title?: string
}>()

const embedUrl = computed(() => youtubeEmbedUrl(props.youtubeId))
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-xl bg-black shadow-lg" style="aspect-ratio: 16/9">
    <iframe
      v-if="embedUrl"
      class="absolute inset-0 h-full w-full"
      :src="embedUrl"
      :title="title ?? 'Aula'"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
    <div v-else class="absolute inset-0 grid place-items-center text-sm text-white/70">
      Vídeo não configurado
    </div>
  </div>
</template>
