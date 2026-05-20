<script setup lang="ts">
definePageMeta({ layout: false })

if (import.meta.client)
  await navigateTo('/login', { replace: true })
else
  await navigateTo('/login', { redirectCode: 302 })
</script>

<template>
  <div />
</template>
