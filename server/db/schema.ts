import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const cargoEnum = pgEnum('cargo', [
  'super_admin',
  'diretor',
  'gerente',
  'corretor',
  'operacional',
])

/** Resultado do contato com o lead. */
export const feedbackStatusEnum = pgEnum('feedback_status', [
  'interessado',
  'nao-interessado',
  'recontatar',
  'numero-invalido',
])

/** Estado do lead na fila do corretor. */
export const atendimentoStatusEnum = pgEnum('atendimento_status', [
  'em_atendimento',
  'finalizado',
])

/** De onde o lead veio: da integração C2S ou de um mailing importado (CSV). */
export const origemLeadEnum = pgEnum('origem_lead', ['c2s', 'mailing'])

/**
 * Quais origens de lead um setor consome. Um setor `mailing` NUNCA consulta a
 * C2S — é o caso da equipe dedicada a trabalhar só uma lista externa.
 */
export const setorOrigemEnum = pgEnum('setor_origem', ['c2s', 'mailing', 'ambos'])

export const usuarios = pgTable('usuarios', {
  id: uuid().defaultRandom().primaryKey(),
  cpf: varchar({ length: 11 }).notNull().unique(),
  nome: varchar({ length: 120 }).notNull(),
  email: varchar({ length: 160 }),
  senhaHash: text().notNull(),
  cargo: cargoEnum().notNull().default('operacional'),
  ativo: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
})

export type Usuario = typeof usuarios.$inferSelect
export type NovoUsuario = typeof usuarios.$inferInsert

/**
 * Setor da Oferta Ativa. Criado no sistema pelo gestor: define de onde vêm os
 * leads (`origemLeads`), as tags da C2S usadas para casar leads (`tagsC2s`) e
 * os corretores que atendem o setor.
 *
 * Origem `c2s`: leads vêm ao vivo da fila da C2S, filtrados por tag.
 * Origem `mailing`: leads vêm só de listas importadas para este setor.
 * Origem `ambos`: consome as duas fontes (C2S primeiro).
 */
export const setores = pgTable('setores', {
  id: uuid().defaultRandom().primaryKey(),
  nome: varchar({ length: 120 }).notNull(),
  descricao: text().notNull().default(''),
  cor: varchar({ length: 16 }).notNull().default('#eb194b'),
  ativo: boolean().notNull().default(true),
  origemLeads: setorOrigemEnum().notNull().default('c2s'),
  tagsC2s: jsonb().$type<string[]>().notNull().default([]),
  empreendimentos: jsonb().$type<string[]>().notNull().default([]),
  createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
})

export type Setor = typeof setores.$inferSelect
export type NovoSetor = typeof setores.$inferInsert

/** Corretores atribuídos a um setor (N:N). */
export const setorCorretores = pgTable(
  'setor_corretores',
  {
    setorId: uuid().notNull().references(() => setores.id, { onDelete: 'cascade' }),
    usuarioId: uuid().notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.setorId, t.usuarioId] })],
)

/**
 * Fila / atendimento da Oferta Ativa. Quando um lead é entregue a um corretor
 * ele é travado aqui como `em_atendimento`; ao registrar o feedback vira
 * `finalizado` com o `resultado`. Garante que dois corretores do mesmo setor
 * não trabalhem o mesmo lead.
 */
export const ofertaAtivaAtendimentos = pgTable('oferta_ativa_atendimentos', {
  id: uuid().defaultRandom().primaryKey(),
  usuarioId: uuid().notNull().references(() => usuarios.id),
  setorId: uuid().notNull().references(() => setores.id, { onDelete: 'cascade' }),
  // Único GLOBAL: um lead só é trabalhado uma vez em todo o sistema —
  // não repete nem é disputado entre campanhas/corretores. Para leads de
  // mailing guarda o id do registro em `oferta_ativa_leads`, não um id da C2S.
  c2sLeadId: varchar({ length: 64 }).notNull().unique(),
  origem: origemLeadEnum().notNull().default('c2s'),
  leadNome: varchar({ length: 160 }),
  leadTelefone: varchar({ length: 40 }),
  leadEmpreendimento: varchar({ length: 200 }),
  status: atendimentoStatusEnum().notNull().default('em_atendimento'),
  resultado: feedbackStatusEnum(),
  observacao: text().notNull().default(''),
  atribuidoEm: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  finalizadoEm: timestamp({ withTimezone: true }),
})

export type Atendimento = typeof ofertaAtivaAtendimentos.$inferSelect
export type NovoAtendimento = typeof ofertaAtivaAtendimentos.$inferInsert

/**
 * Leads locais da Oferta Ativa. Duas origens convivem aqui:
 *
 * - `mailing`: importados de CSV pelo gestor para um setor específico
 *   (`setorId` obrigatório na prática). A fila consome estes registros
 *   diretamente — são a lista externa da equipe.
 * - `c2s`: espelho dos leads recebidos por push (webhook `POST /api/c2s/webhook`)
 *   ou por sync via pull. Serve de FALLBACK: se a C2S estiver fora do ar na hora
 *   de distribuir, a fila usa o que já foi espelhado aqui em vez de travar.
 *
 * `telefoneNormalizado` guarda só os dígitos e é o que usamos para deduplicar
 * um mailing (o mesmo número não entra duas vezes no mesmo setor).
 */
export const ofertaAtivaLeads = pgTable(
  'oferta_ativa_leads',
  {
    id: uuid().defaultRandom().primaryKey(),
    c2sLeadId: varchar({ length: 64 }).notNull().unique(),
    origem: origemLeadEnum().notNull().default('c2s'),
    /** Setor dono do lead. Sempre preenchido para mailing; nulo para C2S. */
    setorId: uuid().references(() => setores.id, { onDelete: 'cascade' }),
    /** Agrupa os leads de uma mesma importação, para listar e desfazer o lote. */
    loteId: uuid(),
    importadoPor: uuid().references(() => usuarios.id, { onDelete: 'set null' }),
    nome: varchar({ length: 160 }).notNull().default('Sem nome'),
    telefone: varchar({ length: 40 }).notNull().default(''),
    telefoneNormalizado: varchar({ length: 20 }).notNull().default(''),
    email: varchar({ length: 160 }),
    empreendimento: varchar({ length: 200 }),
    tags: jsonb().$type<string[]>().notNull().default([]),
    raw: jsonb(),
    recebidoEm: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  },
  t => [
    index('oferta_ativa_leads_setor_origem_idx').on(t.setorId, t.origem),
    index('oferta_ativa_leads_lote_idx').on(t.loteId),
  ],
)

export type LeadCache = typeof ofertaAtivaLeads.$inferSelect
export type NovoLeadCache = typeof ofertaAtivaLeads.$inferInsert

/** Catálogo de empreendimentos (gerido na área de configuração). */
export const empreendimentos = pgTable('empreendimentos', {
  id: uuid().defaultRandom().primaryKey(),
  nome: varchar({ length: 160 }).notNull(),
  tipo: varchar({ length: 60 }).notNull().default(''),
  dormitorios: integer().notNull().default(0),
  suites: integer().notNull().default(0),
  vagas: integer().notNull().default(0),
  areaM2: integer().notNull().default(0),
  estagio: varchar({ length: 40 }).notNull().default(''),
  dataEntrega: varchar({ length: 40 }).notNull().default(''),
  endereco: varchar({ length: 200 }).notNull().default(''),
  bairro: varchar({ length: 120 }).notNull().default(''),
  incorporador: varchar({ length: 120 }).notNull().default(''),
  coordenador: varchar({ length: 120 }).notNull().default(''),
  createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
})

export type Empreendimento = typeof empreendimentos.$inferSelect
export type NovoEmpreendimento = typeof empreendimentos.$inferInsert

/** Capacitação: temas (trilhas) e seus vídeos. */
export const capacitacaoTemas = pgTable('capacitacao_temas', {
  id: uuid().defaultRandom().primaryKey(),
  nome: varchar({ length: 160 }).notNull(),
  descricao: text().notNull().default(''),
  ordem: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
})

export const capacitacaoVideos = pgTable('capacitacao_videos', {
  id: uuid().defaultRandom().primaryKey(),
  temaId: uuid().notNull().references(() => capacitacaoTemas.id, { onDelete: 'cascade' }),
  titulo: varchar({ length: 200 }).notNull(),
  descricao: text().notNull().default(''),
  youtubeId: varchar({ length: 40 }).notNull().default(''),
  duracaoMin: integer().notNull().default(0),
  ordem: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
})

/** Progresso por usuário: vídeos concluídos. */
export const capacitacaoProgresso = pgTable(
  'capacitacao_progresso',
  {
    usuarioId: uuid().notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
    videoId: uuid().notNull().references(() => capacitacaoVideos.id, { onDelete: 'cascade' }),
    concluidoEm: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  },
  t => [primaryKey({ columns: [t.usuarioId, t.videoId] })],
)

/** Notas de aula por usuário e vídeo. */
export const capacitacaoNotas = pgTable(
  'capacitacao_notas',
  {
    usuarioId: uuid().notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
    videoId: uuid().notNull().references(() => capacitacaoVideos.id, { onDelete: 'cascade' }),
    texto: text().notNull().default(''),
    updatedAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
  },
  t => [primaryKey({ columns: [t.usuarioId, t.videoId] })],
)

export type CapacitacaoTemaRow = typeof capacitacaoTemas.$inferSelect
export type CapacitacaoVideoRow = typeof capacitacaoVideos.$inferSelect
