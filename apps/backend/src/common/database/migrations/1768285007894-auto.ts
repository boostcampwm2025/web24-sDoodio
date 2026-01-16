import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768285007894 implements MigrationInterface {
  name = 'Auto1768285007894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_status_enum" AS ENUM('completed', 'skipped', 'ignored')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_origin_enum" AS ENUM('user', 'recommendation')`,
    );
    await queryRunner.query(
      `CREATE TABLE "today_behaviors" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "date" date NOT NULL, "status" "public"."today_behaviors_status_enum" NOT NULL, "origin" "public"."today_behaviors_origin_enum" NOT NULL, "behaviorId" uuid, "userId" uuid, CONSTRAINT "PK_2e78bbed4665e030cac6457348c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "today_behaviors"`);
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_origin_enum"`);
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_status_enum"`);
  }
}
