CREATE TYPE "public"."cargo" AS ENUM('super_admin', 'diretor', 'gerente', 'corretor', 'operacional');--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"nome" varchar(120) NOT NULL,
	"email" varchar(160),
	"senha_hash" text NOT NULL,
	"cargo" "cargo" DEFAULT 'operacional' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_cpf_unique" UNIQUE("cpf")
);
