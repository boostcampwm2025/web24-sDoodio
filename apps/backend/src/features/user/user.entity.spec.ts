import { getMetadataArgsStorage } from 'typeorm';
import { User } from './user.entity';

const storage = getMetadataArgsStorage();

const getTableName = (target: Function): string | undefined =>
  storage.tables.find((table) => table.target === target)?.name;

const getColumnNames = (target: Function): string[] =>
  storage.columns.filter((column) => column.target === target).map((column) => column.propertyName);

describe('User', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(User)).toBe('users');
    expect(getColumnNames(User)).toEqual(expect.arrayContaining(['nickname']));
  });
});
