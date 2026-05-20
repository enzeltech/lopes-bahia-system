<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-50">
    <AppHeader />

    <main class="flex-1">
      <div class="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>
