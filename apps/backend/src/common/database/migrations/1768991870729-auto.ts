import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768991870729 implements MigrationInterface {
  name = 'Auto1768991870729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "behaviorCompletedTopNCounts" SET DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "goalCompletedTopNCounts" SET DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "goalCompletedCounts" SET DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "weeklyDailyDifficultyCompletedCounts" SET DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "dailyDifficultyCompletedCounts" SET DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "weeklyDifficultyCompletedCounts" SET DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "totalDifficultyCompletedCounts" SET DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "notDoneCounts" SET DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "completionTimeBuckets" SET DEFAULT '{}'::jsonb`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f12559a4dd818ebe8ca9ee13af" ON "daily_user_stats" ("userId", "statDate") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_f12559a4dd818ebe8ca9ee13af"`);
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "completionTimeBuckets" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "notDoneCounts" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "totalDifficultyCompletedCounts" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "weeklyDifficultyCompletedCounts" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "dailyDifficultyCompletedCounts" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "weeklyDailyDifficultyCompletedCounts" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "goalCompletedCounts" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "goalCompletedTopNCounts" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_user_stats" ALTER COLUMN "behaviorCompletedTopNCounts" SET DEFAULT '[]'`,
    );
  }
}
