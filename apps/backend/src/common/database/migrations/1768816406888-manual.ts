import { MigrationInterface, QueryRunner } from 'typeorm';

export class Manual1768816406888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid varchar NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        PRIMARY KEY (sid)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_sessions;`);
  }
}
