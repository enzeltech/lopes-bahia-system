CREATE TABLE "capacitacao_notas" (
	"usuario_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capacitacao_notas_usuario_id_video_id_pk" PRIMARY KEY("usuario_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "capacitacao_progresso" (
	"usuario_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"concluido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capacitacao_progresso_usuario_id_video_id_pk" PRIMARY KEY("usuario_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "capacitacao_temas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(160) NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capacitacao_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tema_id" uuid NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"youtube_id" varchar(40) DEFAULT '' NOT NULL,
	"duracao_min" integer DEFAULT 0 NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "capacitacao_notas" ADD CONSTRAINT "capacitacao_notas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacao_notas" ADD CONSTRAINT "capacitacao_notas_video_id_capacitacao_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."capacitacao_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacao_progresso" ADD CONSTRAINT "capacitacao_progresso_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacao_progresso" ADD CONSTRAINT "capacitacao_progresso_video_id_capacitacao_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."capacitacao_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacao_videos" ADD CONSTRAINT "capacitacao_videos_tema_id_capacitacao_temas_id_fk" FOREIGN KEY ("tema_id") REFERENCES "public"."capacitacao_temas"("id") ON DELETE cascade ON UPDATE no action;