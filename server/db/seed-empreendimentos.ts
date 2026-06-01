import { empreendimentosMock } from '../../app/lib/mocks/empreendimentos'
import { useDb } from './client'
import { empreendimentos } from './schema'

async function main() {
  const db = useDb()
  const existentes = await db.select({ id: empreendimentos.id }).from(empreendimentos)
  if (existentes.length) {
    console.log(`já existem ${existentes.length} empreendimentos — pulando seed`)
    return
  }
  for (const e of empreendimentosMock) {
    const { id: _id, ...dados } = e
    await db.insert(empreendimentos).values(dados)
    console.log(`  ✓ ${dados.nome}`)
  }
  console.log(`seed concluído: ${empreendimentosMock.length} empreendimentos`)
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
