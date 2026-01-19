import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1768835436746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "app_samples"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_samples" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_db732db93b96ef029570b7f6914" PRIMARY KEY ("id"))`,
    );
  }
}
