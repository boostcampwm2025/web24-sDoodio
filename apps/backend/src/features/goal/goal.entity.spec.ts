import { getMetadataArgsStorage } from 'typeorm';
import { Goal } from './goal.entity';

const storage = getMetadataArgsStorage();

const getTableName = (target: Function): string | undefined =>
  storage.tables.find((table) => table.target === target)?.name;

const getColumnNames = (target: Function): string[] =>
  storage.columns.filter((column) => column.target === target).map((column) => column.propertyName);

const getRelation = (target: Function, propertyName: string) =>
  storage.relations.find(
    (relation) => relation.target === target && relation.propertyName === propertyName,
  );

const getJoinColumn = (target: Function, propertyName: string) =>
  storage.joinColumns.find(
    (joinColumn) => joinColumn.target === target && joinColumn.propertyName === propertyName,
  );

describe('Goal', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(Goal)).toBe('goals');
    expect(getColumnNames(Goal)).toEqual(expect.arrayContaining(['title', 'color']));
  });

  it('User, Behavior 관계 매핑을 가진다', () => {
    const userRelation = getRelation(Goal, 'user');
    expect(userRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(Goal, 'user')?.name).toBe('userId');

    const behaviorsRelation = getRelation(Goal, 'behaviors');
    expect(behaviorsRelation?.relationType).toBe('one-to-many');
  });
});
