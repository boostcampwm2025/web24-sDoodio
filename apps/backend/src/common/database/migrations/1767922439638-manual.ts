import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1767921275683 implements MigrationInterface {
  name = 'Manual1767921275683';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."behaviors_difficulty_enum" RENAME VALUE '이어하기' TO '이어가기'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."behaviors_difficulty_enum" RENAME VALUE '이어가기' TO '이어하기'`,
    );
  }
}
