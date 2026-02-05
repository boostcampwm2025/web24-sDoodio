import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1770271968821 implements MigrationInterface {
  name = 'Auto1770271968821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_stat_event_logs_user_id" ON "stat_event_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_push_subscriptions_user_id" ON "push_subscriptions" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_today_behaviors_user_id" ON "today_behaviors" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_today_behaviors_behavior_id" ON "today_behaviors" ("behaviorId") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_behaviors_goal_id" ON "behaviors" ("goalId") `);
    await queryRunner.query(
      `CREATE INDEX "idx_dodo_chat_messages_user_id" ON "dodo_chat_messages" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_behaviors_user_id" ON "ai_behaviors" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_behaviors_goal_id" ON "ai_behaviors" ("goalId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_ai_behaviors_goal_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_ai_behaviors_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_dodo_chat_messages_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_behaviors_goal_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_today_behaviors_behavior_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_today_behaviors_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_push_subscriptions_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_stat_event_logs_user_id"`);
  }
}
