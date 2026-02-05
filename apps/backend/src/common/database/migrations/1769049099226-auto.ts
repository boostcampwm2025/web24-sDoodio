import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1769049099226 implements MigrationInterface {
  name = 'Auto1769049099226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "daily_user_stats" DROP COLUMN "originCompletedRatio"`);
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ADD "originCompletedCounts" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "daily_user_stats" DROP COLUMN "originCompletedCounts"`);
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ADD "originCompletedRatio" numeric(4,2) NOT NULL DEFAULT '0'`,
    );
  }
}
