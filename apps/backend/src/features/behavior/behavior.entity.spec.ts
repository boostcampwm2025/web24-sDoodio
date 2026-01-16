import { getMetadataArgsStorage } from 'typeorm';
import { Behavior } from './behavior.entity';

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

describe('Behavior', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(Behavior)).toBe('behaviors');
    expect(getColumnNames(Behavior)).toEqual(expect.arrayContaining(['title', 'difficulty']));
  });

  it('Goal 관계 매핑을 가진다', () => {
    const goalRelation = getRelation(Behavior, 'goal');
    expect(goalRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(Behavior, 'goal')?.name).toBe('goalId');
  });
});
