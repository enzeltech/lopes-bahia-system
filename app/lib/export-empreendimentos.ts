import type { Empreendimento } from '@/types/empreendimento'

interface Coluna {
  header: string
  valor: (e: Empreendimento) => string | number
}

const COLUNAS: Coluna[] = [
  { header: 'Nome', valor: e => e.nome },
  { header: 'Tipo', valor: e => e.tipo },
  { header: 'Dorms', valor: e => e.dormitorios },
  { header: 'Suítes', valor: e => e.suites },
  { header: 'Vagas', valor: e => e.vagas },
  { header: 'Área (m²)', valor: e => e.areaM2 },
  { header: 'Estágio', valor: e => e.estagio },
  { header: 'Entrega', valor: e => e.dataEntrega },
  { header: 'Endereço', valor: e => e.endereco },
  { header: 'Bairro', valor: e => e.bairro },
  { header: 'Incorporador', valor: e => e.incorporador },
  { header: 'Coordenador', valor: e => e.coordenador },
]

function baixar(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}

/** Exporta a lista para CSV (separador ';', compatível com Excel pt-BR). */
export function exportarCsv(lista: Empreendimento[], nomeArquivo = 'empreendimentos.csv') {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const linhas = [
    COLUNAS.map(c => escape(c.header)).join(';'),
    ...lista.map(e => COLUNAS.map(c => escape(c.valor(e))).join(';')),
  ]
  // BOM para o Excel reconhecer os acentos.
  baixar(new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv;charset=utf-8;' }), nomeArquivo)
}

/** Exporta a lista para PDF (tabela em paisagem). */
export async function exportarPdf(lista: Empreendimento[], nomeArquivo = 'empreendimentos.pdf') {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.text('Empreendimentos — Lopes Bahia', 14, 14)
  doc.setFontSize(9)
  doc.text(`${lista.length} empreendimento(s)`, 14, 20)

  autoTable(doc, {
    startY: 24,
    head: [COLUNAS.map(c => c.header)],
    body: lista.map(e => COLUNAS.map(c => String(c.valor(e)))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [235, 25, 75] },
  })

  doc.save(nomeArquivo)
}
