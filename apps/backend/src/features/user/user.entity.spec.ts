import { getMetadataArgsStorage } from 'typeorm';
import { USER_KINDS } from '@web24/shared';
import { User } from './user.entity';

const storage = getMetadataArgsStorage();

const getTableName = (target: Function): string | undefined =>
  storage.tables.find((table) => table.target === target)?.name;

const getColumnNames = (target: Function): string[] =>
  storage.columns.filter((column) => column.target === target).map((column) => column.propertyName);

const getColumnOptions = (target: Function, propertyName: string) =>
  storage.columns.find((column) => column.target === target && column.propertyName === propertyName)
    ?.options;

describe('User', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(User)).toBe('users');
    expect(getColumnNames(User)).toEqual(expect.arrayContaining(['nickname', 'kind']));
  });

  it('kind 컬럼은 enum과 기본값을 가진다', () => {
    const options = getColumnOptions(User, 'kind');
    expect(options?.type).toBe('enum');
    expect(options?.enum).toEqual(Object.values(USER_KINDS));
    expect(options?.default).toBe(USER_KINDS.guest);
  });
});
