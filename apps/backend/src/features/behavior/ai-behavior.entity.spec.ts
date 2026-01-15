import { getMetadataArgsStorage } from 'typeorm';
import { AIBehavior } from './ai-behavior.entity';

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

describe('AIBehavior', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(AIBehavior)).toBe('ai_behaviors');
    expect(getColumnNames(AIBehavior)).toEqual(expect.arrayContaining(['title', 'date', 'status']));
  });

  it('Goal, User 관계 매핑을 가진다', () => {
    const goalRelation = getRelation(AIBehavior, 'goal');
    expect(goalRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(AIBehavior, 'goal')?.name).toBe('goalId');

    const userRelation = getRelation(AIBehavior, 'user');
    expect(userRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(AIBehavior, 'user')?.name).toBe('userId');
  });
});
