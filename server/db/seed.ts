import bcrypt from 'bcryptjs'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { usuarios } from './schema'

const url = process.env.DATABASE_URL
if (!url)
  throw new Error('DATABASE_URL is required')

const client = postgres(url, { prepare: false })
const db = drizzle(client, { schema, casing: 'snake_case' })

interface SeedUser {
  cpf: string
  nome: string
  email?: string
  cargo: typeof schema.cargoEnum.enumValues[number]
  senha: string
}

const SEED_USERS: SeedUser[] = [
  { cpf: '00000000000', nome: 'Super Admin', email: 'admin@lopesbahia.com.br', cargo: 'super_admin', senha: 'admin1234' },
  { cpf: '12345678901', nome: 'Aline Souza', email: 'aline.souza@lopesbahia.com.br', cargo: 'diretor', senha: 'lopes1234' },
  { cpf: '23456789012', nome: 'Rafael Almeida', email: 'rafael.almeida@lopesbahia.com.br', cargo: 'gerente', senha: 'lopes1234' },
  { cpf: '34567890123', nome: 'Mariana Souza', email: 'mariana.souza@lopesbahia.com.br', cargo: 'gerente', senha: 'lopes1234' },
  { cpf: '45678901234', nome: 'Carla Lima', email: 'carla.lima@lopesbahia.com.br', cargo: 'corretor', senha: 'lopes1234' },
  { cpf: '56789012345', nome: 'Bruno Martins', email: 'bruno.martins@lopesbahia.com.br', cargo: 'corretor', senha: 'lopes1234' },
  { cpf: '67890123456', nome: 'Camila Reis', email: 'camila.reis@lopesbahia.com.br', cargo: 'corretor', senha: 'lopes1234' },
  { cpf: '78901234567', nome: 'Diego Ramos', email: 'diego.ramos@lopesbahia.com.br', cargo: 'operacional', senha: 'lopes1234' },
]

async function main() {
  console.log('Seeding usuarios...')

  for (const u of SEED_USERS) {
    const exists = await db.select({ cpf: usuarios.cpf }).from(usuarios).where(eq(usuarios.cpf, u.cpf))
    if (exists.length > 0) {
      console.log(`  skip ${u.cpf} (${u.nome}) — already exists`)
      continue
    }
    const senhaHash = await bcrypt.hash(u.senha, 10)
    await db.insert(usuarios).values({
      cpf: u.cpf,
      nome: u.nome,
      email: u.email,
      cargo: u.cargo,
      senhaHash,
    })
    console.log(`  ✓ ${u.cpf} (${u.nome}) inserted`)
  }

  const count = await db.execute(sql`SELECT COUNT(*)::int AS total FROM usuarios`)
  console.log(`Total usuarios: ${(count[0] as { total: number }).total}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => client.end())
