import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768877793736 implements MigrationInterface {
  name = 'Auto1768877793736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."today_behaviors_status_enum" RENAME TO "today_behaviors_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_status_enum" AS ENUM('pending', 'completed', 'skipped', 'ignored', 'deleted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "today_behaviors" ALTER COLUMN "status" TYPE "public"."today_behaviors_status_enum" USING "status"::"text"::"public"."today_behaviors_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."today_behaviors_status_enum_old" AS ENUM('pending', 'completed', 'skipped', 'ignored')`,
    );
    await queryRunner.query(
      `ALTER TABLE "today_behaviors" ALTER COLUMN "status" TYPE "public"."today_behaviors_status_enum_old" USING "status"::"text"::"public"."today_behaviors_status_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."today_behaviors_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."today_behaviors_status_enum_old" RENAME TO "today_behaviors_status_enum"`,
    );
  }
}
