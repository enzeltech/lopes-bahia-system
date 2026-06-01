<script setup lang="ts">
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, LogOut, Menu, UserRound } from 'lucide-vue-next'
import { NuxtLink } from '#components'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const props = withDefaults(defineProps<{
  showMenu?: boolean
}>(), {
  showMenu: false,
})

const menuOpen = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  menuOpen.value = false
})

const { user, logout } = useAuthUser()

const now = ref(new Date())
let timerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerId)
    clearInterval(timerId)
})

const formattedDate = computed(() =>
  format(now.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
)

const formattedTime = computed(() =>
  format(now.value, 'HH:mm:ss', { locale: ptBR }),
)

async function onLogout() {
  await logout()
  await navigateTo('/login', { replace: true })
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-brand text-white shadow-sm">
    <div class="mx-auto flex h-20 w-full items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
      <div class="flex items-center gap-3 sm:gap-4">
        <Sheet v-if="props.showMenu" v-model:open="menuOpen">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon-lg"
              class="rounded-full text-white hover:bg-white/15 hover:text-white lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu class="size-6!" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-72 p-0">
            <SheetHeader class="border-b border-border px-4 py-4 text-left">
              <SheetTitle class="text-base font-bold text-foreground">
                Menu
              </SheetTitle>
              <SheetDescription class="sr-only">
                Navegação principal do sistema
              </SheetDescription>
            </SheetHeader>
            <SidebarNav />
          </SheetContent>
        </Sheet>

        <NuxtLink
          to="/dashboard"
          class="flex shrink-0 items-center rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Lopes Bahia — ir para o início"
        >
          <img
            src="/images/lopes-bahia.webp"
            alt="Lopes Bahia"
            class="h-11 w-auto sm:h-12"
          >
        </NuxtLink>
      </div>

      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <HeaderChip class="hidden lg:flex">
          <template #icon>
            <Clock class="size-7" />
          </template>
          <span class="text-xs text-white/85">{{ formattedDate }}</span>
          <span class="text-base font-bold tabular-nums tracking-tight">{{ formattedTime }}</span>
        </HeaderChip>

        <HeaderChip class="hidden min-w-0 max-w-[16rem] md:flex">
          <template #icon>
            <UserRound class="size-7" />
          </template>
          <span class="truncate text-sm font-bold tracking-tight">{{ user?.nome ?? 'Usuário' }}</span>
          <span class="truncate text-xs text-white/85">{{ user?.cargo ?? '—' }}</span>
        </HeaderChip>

        <Button
          variant="brand-inverse"
          size="pill-lg"
          class="hidden sm:inline-flex sm:min-w-[120px]"
          @click="onLogout"
        >
          <LogOut class="size-4" />
          Sair
        </Button>

        <Button
          variant="brand-inverse"
          size="icon-lg"
          class="rounded-full sm:hidden"
          aria-label="Sair"
          @click="onLogout"
        >
          <LogOut class="size-5" />
        </Button>
      </div>
    </div>
  </header>
</template>
