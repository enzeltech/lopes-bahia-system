CREATE TABLE "empreendimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(160) NOT NULL,
	"tipo" varchar(60) DEFAULT '' NOT NULL,
	"dormitorios" integer DEFAULT 0 NOT NULL,
	"suites" integer DEFAULT 0 NOT NULL,
	"vagas" integer DEFAULT 0 NOT NULL,
	"area_m_2" integer DEFAULT 0 NOT NULL,
	"estagio" varchar(40) DEFAULT '' NOT NULL,
	"data_entrega" varchar(40) DEFAULT '' NOT NULL,
	"endereco" varchar(200) DEFAULT '' NOT NULL,
	"bairro" varchar(120) DEFAULT '' NOT NULL,
	"incorporador" varchar(120) DEFAULT '' NOT NULL,
	"coordenador" varchar(120) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
