import { PrimaryColumn } from 'typeorm';

export abstract class BaseIdEntity {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id!: string;
}
