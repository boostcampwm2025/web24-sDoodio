import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768377501583 implements MigrationInterface {
  name = 'Auto1768377501583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."today_behaviors_origin_enum" RENAME TO "today_behaviors_origin_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_origin_enum" AS ENUM('user', 'system')`,
    );
    await queryRunner.query(
      `ALTER TABLE "today_behaviors" ALTER COLUMN "origin" TYPE "public"."today_behaviors_origin_enum" USING "origin"::"text"::"public"."today_behaviors_origin_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_origin_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_origin_enum_old" AS ENUM('user', 'recommendation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "today_behaviors" ALTER COLUMN "origin" TYPE "public"."today_behaviors_origin_enum_old" USING "origin"::"text"::"public"."today_behaviors_origin_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_origin_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."today_behaviors_origin_enum_old" RENAME TO "today_behaviors_origin_enum"`,
    );
  }
}
