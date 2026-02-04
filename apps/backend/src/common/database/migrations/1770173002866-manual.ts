import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1770173002866 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "nickname" TYPE character varying(30)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "nickname" TYPE character varying(10)`,
    );
  }
}
