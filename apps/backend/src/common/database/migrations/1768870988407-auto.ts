import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768870988407 implements MigrationInterface {
  name = 'Auto1768870988407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals" ADD "templateId" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "goals" DROP COLUMN "templateId"`);
  }
}
