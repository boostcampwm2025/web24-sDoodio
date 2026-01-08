import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1767837980166 implements MigrationInterface {
  name = 'Auto1767837980166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."goals_color_enum" RENAME TO "goals_color_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."goals_color_enum" AS ENUM('light-pink', 'pink', 'yellow', 'sand', 'mint', 'blue', 'gray-mint', 'warm-gray', 'beige', 'lavender')`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "color" TYPE "public"."goals_color_enum" USING "color"::"text"::"public"."goals_color_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."goals_color_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."goals_color_enum_old" AS ENUM('#e4b2b9', '#e48b84', '#edc06a', '#d7d1ab', '#abd7b9', '#abd1d7', '#8ba49d', '#b6aea8', '#d7c1ab', '#c9bae3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "goals" ALTER COLUMN "color" TYPE "public"."goals_color_enum_old" USING "color"::"text"::"public"."goals_color_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."goals_color_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."goals_color_enum_old" RENAME TO "goals_color_enum"`,
    );
  }
}
