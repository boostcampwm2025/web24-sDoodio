import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1770050096812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "behaviorRatio" double precision NOT NULL DEFAULT '0.8'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "behaviorRatio"`);
  }
}
