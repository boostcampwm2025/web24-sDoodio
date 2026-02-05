import { getMetadataArgsStorage } from 'typeorm';
import { StatEventLog, EVENT_TYPES } from './stat-event-log.entity';

const storage = getMetadataArgsStorage();

const getTableName = (target: Function): string | undefined =>
  storage.tables.find((table) => table.target === target)?.name;

const getColumnNames = (target: Function): string[] =>
  storage.columns.filter((column) => column.target === target).map((column) => column.propertyName);

const getColumn = (target: Function, propertyName: string) =>
  storage.columns.find(
    (column) => column.target === target && column.propertyName === propertyName,
  );

const getRelation = (target: Function, propertyName: string) =>
  storage.relations.find(
    (relation) => relation.target === target && relation.propertyName === propertyName,
  );

const getJoinColumn = (target: Function, propertyName: string) =>
  storage.joinColumns.find(
    (joinColumn) => joinColumn.target === target && joinColumn.propertyName === propertyName,
  );

describe('StatEventLog', () => {
  it('테이블과 컬럼 매핑을 가진다', () => {
    expect(getTableName(StatEventLog)).toBe('stat_event_logs');
    expect(getColumnNames(StatEventLog)).toEqual(expect.arrayContaining(['eventType']));
  });

  it('User 관계 매핑을 가진다', () => {
    const userRelation = getRelation(StatEventLog, 'user');
    expect(userRelation?.relationType).toBe('many-to-one');
    expect(getJoinColumn(StatEventLog, 'user')?.name).toBe('userId');
  });

  it('eventType enum 매핑을 가진다', () => {
    const eventTypeCol = getColumn(StatEventLog, 'eventType');
    expect(eventTypeCol?.options?.type).toBe('enum');
    expect(eventTypeCol?.options?.enum).toEqual(Object.values(EVENT_TYPES));
  });
});
