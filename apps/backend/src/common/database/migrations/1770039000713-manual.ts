import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1770039000713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "providerId" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_kind_enum" RENAME TO "users_kind_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_kind_enum" AS ENUM('guest', 'user', 'google')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "kind" TYPE "public"."users_kind_enum" USING "kind"::"text"::"public"."users_kind_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kind" SET DEFAULT 'guest'`);
    await queryRunner.query(`DROP TYPE "public"."users_kind_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_kind_enum_old" AS ENUM('guest', 'user')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "kind" TYPE "public"."users_kind_enum_old" USING "kind"::"text"::"public"."users_kind_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kind" SET DEFAULT 'guest'`);
    await queryRunner.query(`DROP TYPE "public"."users_kind_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_kind_enum_old" RENAME TO "users_kind_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "providerId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
  }
}
