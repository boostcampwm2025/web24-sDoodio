import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768453911160 implements MigrationInterface {
  name = 'Auto1768453911160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ai_behaviors_status_enum" AS ENUM('pending', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_behaviors" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(30) NOT NULL, "date" date NOT NULL, "status" "public"."ai_behaviors_status_enum" NOT NULL, "goalId" uuid, "userId" uuid, CONSTRAINT "PK_3ffef2471f4bd43f7bae32418ce" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ai_behaviors"`);
    await queryRunner.query(`DROP TYPE "public"."ai_behaviors_status_enum"`);
  }
}
