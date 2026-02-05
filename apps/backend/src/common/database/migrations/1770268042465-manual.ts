import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1770268042465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "job_execution" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_name" character varying(200) NOT NULL, "params_hash" character varying(64) NOT NULL, "params" jsonb NOT NULL, "status" character varying(20) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE, "ended_at" TIMESTAMP WITH TIME ZONE, "exit_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_81e54343e6d62f09a166d105792" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f657d7ae2e755d9c2ece179a00" ON "job_execution" ("job_name", "params_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "step_execution" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_execution_id" uuid NOT NULL, "step_name" character varying(200) NOT NULL, "status" character varying(20) NOT NULL, "read_count" integer NOT NULL DEFAULT '0', "write_count" integer NOT NULL DEFAULT '0', "skip_count" integer NOT NULL DEFAULT '0', "commit_count" integer NOT NULL DEFAULT '0', "started_at" TIMESTAMP WITH TIME ZONE, "ended_at" TIMESTAMP WITH TIME ZONE, "exit_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_84a069ebe3c4367218e60a88bc8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_190ad29c2ebe3158d18715c964" ON "step_execution" ("job_execution_id", "step_name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "execution_context" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scope" character varying(10) NOT NULL, "scope_id" uuid NOT NULL, "context" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ad304bf2d236845b98cdd66e52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_75017ed21715527d1f80377cdb" ON "execution_context" ("scope", "scope_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "job_lock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lock_key" character varying(300) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e8b2631a4ae4a86de12e2bc254d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a542227aa5fc52c6335a82ce0d" ON "job_lock" ("lock_key") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_a542227aa5fc52c6335a82ce0d"`);
    await queryRunner.query(`DROP TABLE "job_lock"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_75017ed21715527d1f80377cdb"`);
    await queryRunner.query(`DROP TABLE "execution_context"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_190ad29c2ebe3158d18715c964"`);
    await queryRunner.query(`DROP TABLE "step_execution"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f657d7ae2e755d9c2ece179a00"`);
    await queryRunner.query(`DROP TABLE "job_execution"`);
  }
}
