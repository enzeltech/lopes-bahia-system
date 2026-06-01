CREATE TYPE "public"."atendimento_status" AS ENUM('em_atendimento', 'finalizado');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('interessado', 'nao-interessado', 'recontatar', 'numero-invalido');--> statement-breakpoint
CREATE TABLE "oferta_ativa_atendimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"setor_id" uuid NOT NULL,
	"c2s_lead_id" varchar(64) NOT NULL,
	"lead_nome" varchar(160),
	"status" "atendimento_status" DEFAULT 'em_atendimento' NOT NULL,
	"resultado" "feedback_status",
	"observacao" text DEFAULT '' NOT NULL,
	"atribuido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"finalizado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "setor_corretores" (
	"setor_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	CONSTRAINT "setor_corretores_setor_id_usuario_id_pk" PRIMARY KEY("setor_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "setores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(120) NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"cor" varchar(16) DEFAULT '#eb194b' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"tags_c_2s" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"empreendimentos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oferta_ativa_atendimentos" ADD CONSTRAINT "oferta_ativa_atendimentos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oferta_ativa_atendimentos" ADD CONSTRAINT "oferta_ativa_atendimentos_setor_id_setores_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor_corretores" ADD CONSTRAINT "setor_corretores_setor_id_setores_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setor_corretores" ADD CONSTRAINT "setor_corretores_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;