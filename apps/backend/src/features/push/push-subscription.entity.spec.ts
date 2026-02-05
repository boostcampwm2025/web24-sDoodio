import { getMetadataArgsStorage } from 'typeorm';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { User } from '../user/user.entity';

describe('PushSubscriptionEntity', () => {
  const storage = getMetadataArgsStorage();

  describe('table metadata', () => {
    it('push_subscriptions 테이블을 사용한다', () => {
      const table = storage.tables.find((item) => item.target === PushSubscriptionEntity);

      expect(table?.name).toBe('push_subscriptions');
    });
  });

  describe('columns', () => {
    it('endpoint 컬럼을 text + unique로 정의한다', () => {
      const column = storage.columns.find(
        (item) => item.target === PushSubscriptionEntity && item.propertyName === 'endpoint',
      );

      expect(column?.options.type).toBe('text');
      expect(column?.options.unique).toBe(true);
    });

    it('subscription 컬럼을 jsonb로 정의한다', () => {
      const column = storage.columns.find(
        (item) => item.target === PushSubscriptionEntity && item.propertyName === 'subscription',
      );

      expect(column?.options.type).toBe('jsonb');
    });
  });

  describe('relations', () => {
    it('user 관계를 ManyToOne으로 설정한다', () => {
      const relation = storage.relations.find(
        (item) => item.target === PushSubscriptionEntity && item.propertyName === 'user',
      );
      const relationType = relation?.type;
      let resolvedType: unknown = relationType;
      if (relationType !== User && typeof relationType === 'function') {
        resolvedType = (relationType as () => unknown)();
      }

      expect(relation?.relationType).toBe('many-to-one');
      expect(resolvedType).toBe(User);
      expect(relation?.options?.createForeignKeyConstraints).toBe(false);
    });

    it('userId 조인 컬럼을 사용한다', () => {
      const joinColumn = storage.joinColumns.find(
        (item) => item.target === PushSubscriptionEntity && item.propertyName === 'user',
      );

      expect(joinColumn?.name).toBe('userId');
    });
  });
});
