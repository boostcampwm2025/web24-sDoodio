import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1767699802337 implements MigrationInterface {
  name = 'Auto1767699802337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_samples" ("id" SERIAL NOT NULL, "name" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_db732db93b96ef029570b7f6914" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "app_samples"`);
  }
}
