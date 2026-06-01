<script setup lang="ts">
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import type { SetorFormPayload } from '@/composables/useSetoresAdmin'
import type { Corretor, Setor } from '@/types/oferta-ativa'

const props = defineProps<{
  open: boolean
  setor?: Setor | null
  corretores: Corretor[]
  tagsDisponiveis: string[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', payload: SetorFormPayload, id: string | null): void
}>()

const isEditing = computed(() => !!props.setor)
const submitError = ref<string | null>(null)

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const nome = ref('')
const descricao = ref('')
const cor = ref('#eb194b')
const tagsSelecionadas = ref<string[]>([])
const corretoresSelecionados = ref<string[]>([])
const tagManual = ref('')

watch(
  () => props.open,
  (open) => {
    submitError.value = null
    if (!open)
      return
    const s = props.setor
    nome.value = s?.nome ?? ''
    descricao.value = s?.descricao ?? ''
    cor.value = s?.cor ?? '#eb194b'
    tagsSelecionadas.value = [...(s?.tagsC2s ?? [])]
    corretoresSelecionados.value = [...(s?.corretores ?? [])]
    tagManual.value = ''
  },
  { immediate: true },
)

/** União das tags da C2S com as já selecionadas (inclui tags adicionadas à mão). */
const tagsParaExibir = computed(() => {
  const set = new Set<string>([...props.tagsDisponiveis, ...tagsSelecionadas.value])
  return [...set].sort((a, b) => a.localeCompare(b))
})

function toggleTag(tag: string) {
  const i = tagsSelecionadas.value.indexOf(tag)
  if (i >= 0)
    tagsSelecionadas.value.splice(i, 1)
  else
    tagsSelecionadas.value.push(tag)
}

function addTagManual() {
  const t = tagManual.value.trim()
  if (t && !tagsSelecionadas.value.includes(t))
    tagsSelecionadas.value.push(t)
  tagManual.value = ''
}

function toggleCorretor(id: string) {
  const i = corretoresSelecionados.value.indexOf(id)
  if (i >= 0)
    corretoresSelecionados.value.splice(i, 1)
  else
    corretoresSelecionados.value.push(id)
}

function onSubmit() {
  if (!nome.value.trim()) {
    submitError.value = 'Informe o nome do setor.'
    return
  }
  emit('submit', {
    nome: nome.value.trim(),
    descricao: descricao.value.trim(),
    cor: cor.value,
    tagsC2s: [...tagsSelecionadas.value],
    empreendimentos: props.setor?.empreendimentos ?? [],
    corretores: [...corretoresSelecionados.value],
  }, props.setor?.id ?? null)
}

function setError(message: string) {
  submitError.value = message
}

defineExpose({ setError })
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Editar setor' : 'Novo setor' }}
        </DialogTitle>
        <DialogDescription>
          Defina as tags da C2S que alimentam este setor e os corretores que o atendem.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <div class="space-y-1.5">
          <Label for="setor-nome">Nome</Label>
          <Input id="setor-nome" v-model="nome" type="text" placeholder="Ex.: Setor Pituba" />
        </div>

        <div class="space-y-1.5">
          <Label for="setor-descricao">Descrição</Label>
          <Textarea id="setor-descricao" v-model="descricao" rows="2" placeholder="Opcional" />
        </div>

        <div class="space-y-1.5">
          <Label for="setor-cor">Cor</Label>
          <input id="setor-cor" v-model="cor" type="color" class="h-9 w-16 cursor-pointer rounded border border-border bg-background">
        </div>

        <div class="space-y-2">
          <Label>Tags da C2S (match dos leads)</Label>
          <p class="text-xs text-muted-foreground">
            Leads com pelo menos uma dessas tags entram no setor. Sem tags, o setor recebe todos os leads.
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in tagsParaExibir"
              :key="tag"
              type="button"
              :class="cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                tagsSelecionadas.includes(tag)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border bg-background text-muted-foreground hover:border-brand/40',
              )"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
            <span v-if="!tagsParaExibir.length" class="text-xs text-muted-foreground">
              Nenhuma tag da C2S disponível. Adicione manualmente abaixo.
            </span>
          </div>
          <div class="flex gap-2">
            <Input v-model="tagManual" type="text" placeholder="Adicionar tag manualmente" @keydown.enter.prevent="addTagManual" />
            <Button type="button" variant="outline" size="sm" @click="addTagManual">
              Adicionar
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Corretores do setor</Label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="c in corretores"
              :key="c.id"
              type="button"
              :class="cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                corretoresSelecionados.includes(c.id)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border bg-background text-muted-foreground hover:border-brand/40',
              )"
              @click="toggleCorretor(c.id)"
            >
              {{ c.nome }}
            </button>
            <span v-if="!corretores.length" class="text-xs text-muted-foreground">
              Nenhum corretor cadastrado.
            </span>
          </div>
        </div>

        <p v-if="submitError" class="text-sm text-destructive">
          {{ submitError }}
        </p>

        <DialogFooter class="gap-2 sm:gap-2">
          <Button type="button" variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            {{ isEditing ? 'Salvar alterações' : 'Criar setor' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
