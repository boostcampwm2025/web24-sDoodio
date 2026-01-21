import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768981535614 implements MigrationInterface {
  name = 'Auto1768981535614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."stat_event_logs_eventtype_enum" AS ENUM('CHECK_IN', 'DUDU_CATCH', 'DUDU_MISS', 'REFRESH_TODAY_BEHAVIORS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stat_event_logs" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "eventType" "public"."stat_event_logs_eventtype_enum" NOT NULL, "userId" uuid, CONSTRAINT "PK_6ac03affa333df38c4cfdf9169b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_user_stats_goalcountdegree_enum" AS ENUM('MUCH_LESS', 'LESS', 'NEUTRAL', 'MORE', 'MUCH_MORE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."daily_user_stats_behaviorcountdegree_enum" AS ENUM('MUCH_LESS', 'LESS', 'NEUTRAL', 'MORE', 'MUCH_MORE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_user_stats" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "totalCompletedCounts" bigint NOT NULL DEFAULT '0', "behaviorCompletedTopNCounts" jsonb NOT NULL DEFAULT '[]'::jsonb, "goalCompletedTopNCounts" jsonb NOT NULL DEFAULT '[]'::jsonb, "goalCompletedCounts" jsonb NOT NULL DEFAULT '[]'::jsonb, "difficultyRatios" jsonb NOT NULL DEFAULT '[]'::jsonb, "dailyDifficultyCompletedCounts" jsonb NOT NULL DEFAULT '{}'::jsonb, "weeklyDifficultyCompletedCounts" jsonb NOT NULL DEFAULT '{}'::jsonb, "totalDifficultyCompletedCounts" jsonb NOT NULL DEFAULT '{}'::jsonb, "originCompletedCounts" numeric(4,2) NOT NULL DEFAULT '0', "notDoneCounts" jsonb NOT NULL DEFAULT '{}'::jsonb, "completionTimeBuckets" jsonb NOT NULL DEFAULT '{}'::jsonb, "checkInTotal" bigint NOT NULL DEFAULT '0', "duduCatchTotal" bigint NOT NULL DEFAULT '0', "goalCountDegree" "public"."daily_user_stats_goalcountdegree_enum" NOT NULL, "behaviorCountDegree" "public"."daily_user_stats_behaviorcountdegree_enum" NOT NULL, "avgRefreshPerDay" numeric(6,2), "avgCompletedPerDay" numeric(6,2), "userId" uuid, CONSTRAINT "PK_665fa6c6c694d33c4f996228865" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "goals" ADD "templateId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals" DROP COLUMN "templateId"`);
    await queryRunner.query(`DROP TABLE "daily_user_stats"`);
    await queryRunner.query(`DROP TYPE "public"."daily_user_stats_behaviorcountdegree_enum"`);
    await queryRunner.query(`DROP TYPE "public"."daily_user_stats_goalcountdegree_enum"`);
    await queryRunner.query(`DROP TABLE "stat_event_logs"`);
    await queryRunner.query(`DROP TYPE "public"."stat_event_logs_eventtype_enum"`);
  }
}
