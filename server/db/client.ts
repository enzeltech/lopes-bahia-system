import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db)
    return _db

  const url = process.env.DATABASE_URL
  if (!url)
    throw new Error('DATABASE_URL is required')

  const sql = postgres(url, { prepare: false })
  _db = drizzle(sql, { schema, casing: 'snake_case' })
  return _db
}
