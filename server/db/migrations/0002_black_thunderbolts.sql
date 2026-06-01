CREATE TABLE "oferta_ativa_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"c2s_lead_id" varchar(64) NOT NULL,
	"nome" varchar(160) DEFAULT 'Sem nome' NOT NULL,
	"telefone" varchar(40) DEFAULT '' NOT NULL,
	"email" varchar(160),
	"empreendimento" varchar(200),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"raw" jsonb,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oferta_ativa_leads_c2sLeadId_unique" UNIQUE("c2s_lead_id")
);
