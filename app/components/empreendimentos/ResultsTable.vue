<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Empreendimento, EstagioEmpreendimento } from '@/types/empreendimento'

defineProps<{
  empreendimentos: Empreendimento[]
}>()

const estagioStyles: Record<EstagioEmpreendimento, string> = {
  'Lançamento': 'bg-amber-100 text-amber-800',
  'Em obras': 'bg-blue-100 text-blue-800',
  'Pronto para morar': 'bg-emerald-100 text-emerald-800',
  'Entregue': 'bg-neutral-200 text-neutral-700',
}

function estagioClass(value: EstagioEmpreendimento) {
  return cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', estagioStyles[value])
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow class="bg-muted/50">
          <TableHead class="font-semibold text-foreground">
            Nome
          </TableHead>
          <TableHead class="text-center font-semibold text-foreground">
            Dorms
          </TableHead>
          <TableHead class="text-center font-semibold text-foreground">
            Suítes
          </TableHead>
          <TableHead class="text-center font-semibold text-foreground">
            Vagas
          </TableHead>
          <TableHead class="text-right font-semibold text-foreground">
            Área (m²)
          </TableHead>
          <TableHead class="font-semibold text-foreground">
            Estágio
          </TableHead>
          <TableHead class="font-semibold text-foreground">
            Entrega
          </TableHead>
          <TableHead class="font-semibold text-foreground">
            Bairro
          </TableHead>
          <TableHead class="font-semibold text-foreground">
            Incorporador
          </TableHead>
          <TableHead class="font-semibold text-foreground">
            Coordenador
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="emp in empreendimentos"
          :key="emp.id"
          class="hover:bg-muted/30"
        >
          <TableCell class="font-medium text-foreground">
            {{ emp.nome }}
          </TableCell>
          <TableCell class="text-center tabular-nums">
            {{ emp.dormitorios || '—' }}
          </TableCell>
          <TableCell class="text-center tabular-nums">
            {{ emp.suites || '—' }}
          </TableCell>
          <TableCell class="text-center tabular-nums">
            {{ emp.vagas || '—' }}
          </TableCell>
          <TableCell class="text-right tabular-nums">
            {{ emp.areaM2 }}
          </TableCell>
          <TableCell>
            <span :class="estagioClass(emp.estagio)">{{ emp.estagio }}</span>
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ emp.dataEntrega }}
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ emp.bairro }}
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ emp.incorporador }}
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ emp.coordenador }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
