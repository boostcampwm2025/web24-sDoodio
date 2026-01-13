import { getMetadataArgsStorage } from 'typeorm';
import { TodayBehavior } from './today-behavior.entity';

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

describe('TodayBehavior', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(TodayBehavior)).toBe('today_behaviors');
    expect(getColumnNames(TodayBehavior)).toEqual(
      expect.arrayContaining(['date', 'status', 'origin']),
    );
  });

  it('Behavior, User 관계 매핑을 가진다', () => {
    const behaviorRelation = getRelation(TodayBehavior, 'behavior');
    expect(behaviorRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(TodayBehavior, 'behavior')?.name).toBe('behaviorId');

    const userRelation = getRelation(TodayBehavior, 'user');
    expect(userRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(TodayBehavior, 'user')?.name).toBe('userId');
  });
});
