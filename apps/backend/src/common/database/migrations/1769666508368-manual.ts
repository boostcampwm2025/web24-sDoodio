import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1769666508368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "goals" ADD CONSTRAINT "uq_goals_userId_title" UNIQUE ("userId", "title")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "uq_goals_userId_title"`);
  }
}
