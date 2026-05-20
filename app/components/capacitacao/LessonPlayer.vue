<script setup lang="ts">
defineProps<{
  youtubeId: string
  title?: string
}>()
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-xl bg-black shadow-lg" style="aspect-ratio: 16/9">
    <iframe
      class="absolute inset-0 h-full w-full"
      :src="`https://www.youtube.com/embed/${youtubeId}?rel=0`"
      :title="title ?? 'Aula'"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
  </div>
</template>
