<script setup lang="ts">
import { Building2, Mail, Phone, UserRound } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Lead } from '@/types/oferta-ativa'

defineProps<{
  lead: Lead
}>()
</script>

<template>
  <Card class="p-6">
    <div class="flex flex-col gap-5">
      <div class="flex items-start gap-4">
        <span class="grid size-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
          <UserRound class="size-6" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-lg font-bold text-foreground sm:text-xl">
            {{ lead.nome }}
          </h2>
          <div v-if="lead.tags.length" class="mt-2 flex flex-wrap gap-1.5">
            <Badge v-for="tag in lead.tags" :key="tag" variant="secondary" class="text-xs">
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div class="flex items-center gap-2.5">
          <Phone class="size-4 text-muted-foreground" />
          <a :href="`tel:${lead.telefone.replace(/\D/g, '')}`" class="text-foreground hover:text-brand">
            {{ lead.telefone }}
          </a>
        </div>
        <div v-if="lead.email" class="flex items-center gap-2.5">
          <Mail class="size-4 text-muted-foreground" />
          <a :href="`mailto:${lead.email}`" class="truncate text-foreground hover:text-brand">
            {{ lead.email }}
          </a>
        </div>
        <div v-if="lead.empreendimento" class="flex items-center gap-2.5 sm:col-span-2">
          <Building2 class="size-4 text-muted-foreground" />
          <span class="text-foreground">{{ lead.empreendimento }}</span>
        </div>
      </dl>
    </div>
  </Card>
</template>
