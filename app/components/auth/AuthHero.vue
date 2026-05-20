<script setup lang="ts">
withDefaults(defineProps<{
  imageSrc?: string
  imageAlt?: string
}>(), {
  imageSrc: '/images/fundoLogin.webp',
  imageAlt: 'Sala de cinema Lopes Bahia',
})
</script>

<template>
  <div class="relative flex h-full w-full items-center justify-center overflow-hidden">
    <img
      :src="imageSrc"
      :alt="imageAlt"
      class="h-full w-full object-contain"
    >

    <div class="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      <DateTimeStamp align="center" tone="light" />
    </div>
  </div>
</template>
