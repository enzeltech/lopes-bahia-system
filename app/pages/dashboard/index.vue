<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

interface MenuItem {
  title: string
  imageSrc: string
  to: string
  superAdminOnly?: boolean
}

const { user, isSuperAdmin } = useAuthUser()

const menuItems: MenuItem[] = [
  { title: 'Empreendimentos', imageSrc: '/images/empreendimentos.webp', to: '/dashboard/empreendimentos' },
  { title: 'Oferta Ativa', imageSrc: '/images/ofertaativa.webp', to: '/dashboard/oferta-ativa' },
  { title: 'Capacitação', imageSrc: '/images/capacitacao.webp', to: '/dashboard/capacitacao' },
  { title: 'Links Úteis', imageSrc: '/images/linksuteis.webp', to: '/dashboard/links-uteis' },
  { title: 'Configuração', imageSrc: '/images/configuracao.webp', to: '/dashboard/configuracao', superAdminOnly: true },
]

const visibleItems = computed(() =>
  menuItems.filter(item => !item.superAdminOnly || isSuperAdmin.value),
)
</script>

<template>
  <section class="flex flex-col gap-8">
    <header class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Bem-vindo, {{ user?.nome ?? 'visitante' }}
      </h1>
      <p class="text-sm text-muted-foreground">
        Selecione um módulo para começar.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <MenuCard
        v-for="item in visibleItems"
        :key="item.to"
        :title="item.title.toUpperCase()"
        :image-src="item.imageSrc"
        :to="item.to"
      />
    </div>
  </section>
</template>
