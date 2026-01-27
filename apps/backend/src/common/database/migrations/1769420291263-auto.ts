import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1769420291263 implements MigrationInterface {
  name = 'Auto1769420291263';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dodo_chat_messages" ("id" uuid NOT NULL DEFAULT uuidv7(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" character varying(20) NOT NULL, "content" text NOT NULL, "userId" uuid, CONSTRAINT "PK_c2df049eb0fb906906b9a56ca2f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dodo_chat_messages"`);
  }
}
