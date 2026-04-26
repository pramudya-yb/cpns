CREATE TABLE "answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_result_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer" text,
	"is_correct" boolean,
	"time_spent_sec" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "answer_unique_idx" UNIQUE("section_result_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "combo_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"creator_user_id" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combo_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_id" uuid NOT NULL,
	"source_package_id" uuid NOT NULL,
	"source_section_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"language" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "package_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"section_type_id" text NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_type_id" text NOT NULL,
	"section_type_id" text NOT NULL,
	"format" text NOT NULL,
	"passage_text" text NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"difficulty" integer DEFAULT 3 NOT NULL,
	"skill_tags" text[] DEFAULT '{}',
	"source" text DEFAULT 'manual' NOT NULL,
	"ai_model" text,
	"ai_prompt_used" text,
	"creator_user_id" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"avg_rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_rating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "questionRating_unique_idx" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "section_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "sectionQuestion_unique_idx" UNIQUE("section_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "section_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"section_type_id" text NOT NULL,
	"score" integer,
	"max_score" integer,
	"time_spent_sec" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_type" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"package_id" uuid,
	"combo_id" uuid,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"total_score" integer,
	"max_score" integer,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"exam_type_id" text NOT NULL,
	"creator_user_id" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"total_sections" integer DEFAULT 0 NOT NULL,
	"estimated_duration_min" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"avg_rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'openai' NOT NULL,
	"base_url" text,
	"api_key_encrypted" text NOT NULL,
	"model_name" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_section_result_id_section_result_id_fk" FOREIGN KEY ("section_result_id") REFERENCES "public"."section_result"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_package" ADD CONSTRAINT "combo_package_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_section" ADD CONSTRAINT "combo_section_combo_id_combo_package_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combo_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_section" ADD CONSTRAINT "combo_section_source_package_id_test_package_id_fk" FOREIGN KEY ("source_package_id") REFERENCES "public"."test_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_section" ADD CONSTRAINT "combo_section_source_section_id_package_section_id_fk" FOREIGN KEY ("source_section_id") REFERENCES "public"."package_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_section" ADD CONSTRAINT "package_section_package_id_test_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."test_package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_section" ADD CONSTRAINT "package_section_section_type_id_section_type_id_fk" FOREIGN KEY ("section_type_id") REFERENCES "public"."section_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_exam_type_id_exam_type_id_fk" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_section_type_id_section_type_id_fk" FOREIGN KEY ("section_type_id") REFERENCES "public"."section_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_rating" ADD CONSTRAINT "question_rating_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_rating" ADD CONSTRAINT "question_rating_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_question" ADD CONSTRAINT "section_question_section_id_package_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."package_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_question" ADD CONSTRAINT "section_question_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_result" ADD CONSTRAINT "section_result_attempt_id_test_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_result" ADD CONSTRAINT "section_result_section_type_id_section_type_id_fk" FOREIGN KEY ("section_type_id") REFERENCES "public"."section_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_package_id_test_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."test_package"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempt" ADD CONSTRAINT "test_attempt_combo_id_combo_package_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combo_package"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_package" ADD CONSTRAINT "test_package_exam_type_id_exam_type_id_fk" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_package" ADD CONSTRAINT "test_package_creator_user_id_user_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_key" ADD CONSTRAINT "user_api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answer_questionId_idx" ON "answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "comboPackage_creatorUserId_idx" ON "combo_package" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "comboPackage_isPublic_idx" ON "combo_package" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "comboSection_comboId_idx" ON "combo_section" USING btree ("combo_id");--> statement-breakpoint
CREATE INDEX "comboSection_sourcePackageId_idx" ON "combo_section" USING btree ("source_package_id");--> statement-breakpoint
CREATE INDEX "packageSection_packageId_idx" ON "package_section" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "packageSection_sectionTypeId_idx" ON "package_section" USING btree ("section_type_id");--> statement-breakpoint
CREATE INDEX "question_examTypeId_idx" ON "question" USING btree ("exam_type_id");--> statement-breakpoint
CREATE INDEX "question_sectionTypeId_idx" ON "question" USING btree ("section_type_id");--> statement-breakpoint
CREATE INDEX "question_creatorUserId_idx" ON "question" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "question_isPublic_idx" ON "question" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "question_format_idx" ON "question" USING btree ("format");--> statement-breakpoint
CREATE INDEX "question_difficulty_idx" ON "question" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "questionRating_questionId_idx" ON "question_rating" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "sectionQuestion_sectionId_idx" ON "section_question" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "sectionResult_attemptId_idx" ON "section_result" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "testAttempt_userId_idx" ON "test_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "testAttempt_packageId_idx" ON "test_attempt" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "testAttempt_status_idx" ON "test_attempt" USING btree ("status");--> statement-breakpoint
CREATE INDEX "testPackage_examTypeId_idx" ON "test_package" USING btree ("exam_type_id");--> statement-breakpoint
CREATE INDEX "testPackage_creatorUserId_idx" ON "test_package" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "testPackage_isPublic_idx" ON "test_package" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "userApiKey_userId_idx" ON "user_api_key" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "userApiKey_isActive_idx" ON "user_api_key" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");