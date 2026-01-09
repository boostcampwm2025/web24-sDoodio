import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1767782727667 implements MigrationInterface {
  name = 'Auto1767782727667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."behaviors_difficulty_enum" AS ENUM('마음열기', '시작하기', '이어하기', '몰입하기', 'AI')`,
    );
    await queryRunner.query(
      `CREATE TABLE "behaviors" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(30) NOT NULL, "difficulty" "public"."behaviors_difficulty_enum" NOT NULL, "goalId" uuid, CONSTRAINT "PK_dc34a2b981fe38b508ba9957255" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "nickname" character varying(10) NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."goals_color_enum" AS ENUM('#e4b2b9', '#e48b84', '#edc06a', '#d7d1ab', '#abd7b9', '#abd1d7', '#8ba49d', '#b6aea8', '#d7c1ab', '#c9bae3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(20) NOT NULL, "color" "public"."goals_color_enum" NOT NULL, "userId" uuid, CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "goals"`);
    await queryRunner.query(`DROP TYPE "public"."goals_color_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "behaviors"`);
    await queryRunner.query(`DROP TYPE "public"."behaviors_difficulty_enum"`);
  }
}
