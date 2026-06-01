<script setup lang="ts">
import { Pencil, Plus, PlayCircle, Trash2 } from 'lucide-vue-next'
import ConfirmDeleteDialog from '@/components/configuracao/ConfirmDeleteDialog.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { extractYoutubeId, youtubeWatchUrl } from '@/lib/youtube'
import type { CapacitacaoTema, CapacitacaoVideo } from '@/types/capacitacao'

definePageMeta({
  layout: 'dashboard-section',
  middleware: ['auth', 'super-admin'],
})

const {
  temas,
  loading,
  erro,
  load,
  createTema,
  updateTema,
  removeTema,
  createVideo,
  updateVideo,
  removeVideo,
} = useCapacitacaoAdmin()

onMounted(() => load())

// --- Modal de tema ---
const temaOpen = ref(false)
const temaEdit = ref<CapacitacaoTema | null>(null)
const temaForm = ref({ nome: '', descricao: '' })

function openTema(t?: CapacitacaoTema) {
  temaEdit.value = t ?? null
  temaForm.value = { nome: t?.nome ?? '', descricao: t?.descricao ?? '' }
  temaOpen.value = true
}
async function saveTema() {
  if (!temaForm.value.nome.trim())
    return
  if (temaEdit.value)
    await updateTema(temaEdit.value.id, { ...temaForm.value })
  else
    await createTema({ ...temaForm.value })
  temaOpen.value = false
}

// --- Modal de vídeo ---
const videoOpen = ref(false)
const videoEdit = ref<CapacitacaoVideo | null>(null)
const videoTemaId = ref('')
const videoForm = ref({ titulo: '', descricao: '', youtubeUrl: '', duracaoMin: 0 })
const videoUrlInvalido = ref(false)

function openVideo(temaId: string, v?: CapacitacaoVideo) {
  videoTemaId.value = temaId
  videoEdit.value = v ?? null
  videoUrlInvalido.value = false
  videoForm.value = {
    titulo: v?.titulo ?? '',
    descricao: v?.descricao ?? '',
    youtubeUrl: v?.youtubeId ? youtubeWatchUrl(v.youtubeId) : '',
    duracaoMin: v?.duracaoMin ?? 0,
  }
  videoOpen.value = true
}
async function saveVideo() {
  if (!videoForm.value.titulo.trim())
    return
  const youtubeId = extractYoutubeId(videoForm.value.youtubeUrl)
  if (videoForm.value.youtubeUrl.trim() && !youtubeId) {
    videoUrlInvalido.value = true
    return
  }
  videoUrlInvalido.value = false
  const payload = {
    titulo: videoForm.value.titulo,
    descricao: videoForm.value.descricao,
    youtubeId,
    duracaoMin: videoForm.value.duracaoMin,
  }
  if (videoEdit.value)
    await updateVideo(videoEdit.value.id, payload)
  else
    await createVideo({ temaId: videoTemaId.value, ...payload })
  videoOpen.value = false
}

// --- Exclusão ---
const deleteOpen = ref(false)
const deleteKind = ref<'tema' | 'video'>('tema')
const deleteId = ref('')
const deleteNome = ref('')

function askDelete(kind: 'tema' | 'video', id: string, nome: string) {
  deleteKind.value = kind
  deleteId.value = id
  deleteNome.value = nome
  deleteOpen.value = true
}
async function confirmDelete() {
  if (deleteKind.value === 'tema')
    await removeTema(deleteId.value)
  else
    await removeVideo(deleteId.value)
  deleteOpen.value = false
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <NuxtLink to="/dashboard/configuracao" class="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover">
          ← Configurações
        </NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Temas e vídeos
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ temas.length }} {{ temas.length === 1 ? 'tema' : 'temas' }}.
        </p>
      </div>
      <Button variant="default" size="sm" @click="openTema()">
        <Plus class="size-4" />
        Novo tema
      </Button>
    </header>

    <Card v-if="erro" class="border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ erro }}
    </Card>

    <Card v-if="loading && !temas.length" class="px-6 py-16 text-center text-sm text-muted-foreground">
      Carregando…
    </Card>

    <Card v-for="tema in temas" v-else :key="tema.id" class="p-6">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-foreground">
            {{ tema.nome }}
          </h2>
          <p v-if="tema.descricao" class="text-sm text-muted-foreground">
            {{ tema.descricao }}
          </p>
        </div>
        <div class="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar tema" @click="openTema(tema)">
            <Pencil class="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Remover tema" @click="askDelete('tema', tema.id, tema.nome)">
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>

      <ul class="flex flex-col divide-y divide-border rounded-lg border border-border">
        <li v-for="v in tema.videos" :key="v.id" class="flex items-center justify-between gap-3 px-4 py-2.5">
          <span class="flex min-w-0 items-center gap-2 text-sm">
            <PlayCircle class="size-4 shrink-0 text-muted-foreground" />
            <span class="truncate text-foreground">{{ v.titulo }}</span>
            <span v-if="v.duracaoMin" class="shrink-0 text-xs text-muted-foreground">{{ v.duracaoMin }} min</span>
          </span>
          <span class="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Editar vídeo" @click="openVideo(tema.id, v)">
              <Pencil class="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Remover vídeo" @click="askDelete('video', v.id, v.titulo)">
              <Trash2 class="size-4" />
            </Button>
          </span>
        </li>
        <li v-if="!tema.videos.length" class="px-4 py-2.5 text-sm text-muted-foreground">
          Nenhum vídeo neste tema.
        </li>
      </ul>

      <Button variant="outline" size="sm" class="mt-3" @click="openVideo(tema.id)">
        <Plus class="size-4" />
        Adicionar vídeo
      </Button>
    </Card>

    <!-- Modal tema -->
    <Dialog v-model:open="temaOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ temaEdit ? 'Editar tema' : 'Novo tema' }}</DialogTitle>
          <DialogDescription>Trilha de capacitação.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="saveTema">
          <div class="space-y-1.5">
            <Label for="tema-nome">Nome</Label>
            <Input id="tema-nome" v-model="temaForm.nome" type="text" />
          </div>
          <div class="space-y-1.5">
            <Label for="tema-desc">Descrição</Label>
            <Textarea id="tema-desc" v-model="temaForm.descricao" rows="2" />
          </div>
          <DialogFooter class="gap-2 sm:gap-2">
            <Button type="button" variant="outline" @click="temaOpen = false">
              Cancelar
            </Button>
            <Button type="submit">
              {{ temaEdit ? 'Salvar' : 'Criar' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal vídeo -->
    <Dialog v-model:open="videoOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ videoEdit ? 'Editar vídeo' : 'Novo vídeo' }}</DialogTitle>
          <DialogDescription>Aula do tema.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="saveVideo">
          <div class="space-y-1.5">
            <Label for="video-titulo">Título</Label>
            <Input id="video-titulo" v-model="videoForm.titulo" type="text" />
          </div>
          <div class="space-y-1.5">
            <Label for="video-desc">Descrição</Label>
            <Textarea id="video-desc" v-model="videoForm.descricao" rows="2" />
          </div>
          <div class="space-y-1.5">
            <Label for="video-yt">Link do YouTube</Label>
            <Input id="video-yt" v-model="videoForm.youtubeUrl" type="text" placeholder="https://www.youtube.com/watch?v=..." />
            <p v-if="videoUrlInvalido" class="text-xs text-destructive">
              Não consegui identificar o vídeo nesse link. Cole a URL do YouTube.
            </p>
            <p v-else class="text-xs text-muted-foreground">
              Cole a URL completa (youtube.com/watch, youtu.be, shorts…).
            </p>
          </div>
          <div class="space-y-1.5">
            <Label for="video-dur">Duração (min)</Label>
            <Input id="video-dur" v-model.number="videoForm.duracaoMin" type="number" min="0" />
          </div>
          <DialogFooter class="gap-2 sm:gap-2">
            <Button type="button" variant="outline" @click="videoOpen = false">
              Cancelar
            </Button>
            <Button type="submit">
              {{ videoEdit ? 'Salvar' : 'Adicionar' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDeleteDialog
      v-model:open="deleteOpen"
      :title="deleteKind === 'tema' ? 'Remover tema' : 'Remover vídeo'"
      :description="`Remover ${deleteNome}? ${deleteKind === 'tema' ? 'Os vídeos do tema também serão removidos.' : ''} Esta ação não pode ser desfeita.`"
      confirm-label="Remover"
      @confirm="confirmDelete"
    />
  </section>
</template>
