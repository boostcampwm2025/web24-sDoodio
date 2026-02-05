import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1768818669690 implements MigrationInterface {
  name = 'Auto1768818669690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_kind_enum" AS ENUM('guest', 'user')`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "kind" "public"."users_kind_enum" NOT NULL DEFAULT 'guest'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."users_kind_enum"`);
  }
}
