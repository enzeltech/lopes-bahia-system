CREATE TYPE "public"."origem_lead" AS ENUM('c2s', 'mailing');--> statement-breakpoint
CREATE TYPE "public"."setor_origem" AS ENUM('c2s', 'mailing', 'ambos');--> statement-breakpoint
ALTER TABLE "oferta_ativa_atendimentos" ADD COLUMN "origem" "origem_lead" DEFAULT 'c2s' NOT NULL;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD COLUMN "origem" "origem_lead" DEFAULT 'c2s' NOT NULL;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD COLUMN "setor_id" uuid;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD COLUMN "lote_id" uuid;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD COLUMN "importado_por" uuid;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD COLUMN "telefone_normalizado" varchar(20) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "setores" ADD COLUMN "origem_leads" "setor_origem" DEFAULT 'c2s' NOT NULL;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD CONSTRAINT "oferta_ativa_leads_setor_id_setores_id_fk" FOREIGN KEY ("setor_id") REFERENCES "public"."setores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oferta_ativa_leads" ADD CONSTRAINT "oferta_ativa_leads_importado_por_usuarios_id_fk" FOREIGN KEY ("importado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oferta_ativa_leads_setor_origem_idx" ON "oferta_ativa_leads" USING btree ("setor_id","origem");--> statement-breakpoint
CREATE INDEX "oferta_ativa_leads_lote_idx" ON "oferta_ativa_leads" USING btree ("lote_id");