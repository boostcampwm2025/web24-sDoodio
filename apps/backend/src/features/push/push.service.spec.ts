import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import webpush from 'web-push';
import type { PushSubscription, SendPushNotificationRequest } from '@web24/shared';
import { PushService } from './push.service';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { User } from '../user/user.entity';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';

jest.mock('web-push', () => ({
  __esModule: true,
  default: {
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

describe('PushService', () => {
  let service: PushService;
  let configService: jest.Mocked<ConfigService>;
  let pushSubscriptionRepository: jest.Mocked<Repository<PushSubscriptionEntity>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let mockWebpush: {
    setVapidDetails: jest.Mock;
    sendNotification: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const map: Record<string, string> = {
                VAPID_PUBLIC_KEY: 'public-key',
                VAPID_PRIVATE_KEY: 'private-key',
                VAPID_SUBJECT: 'mailto:test@example.com',
              };
              return map[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(PushSubscriptionEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            upsert: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DodoChatMessage),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PushService>(PushService);
    configService = module.get(ConfigService);
    pushSubscriptionRepository = module.get(getRepositoryToken(PushSubscriptionEntity));
    userRepository = module.get(getRepositoryToken(User));
    mockWebpush = webpush as unknown as typeof mockWebpush;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('VAPID 설정을 초기화한다', () => {
      service.onModuleInit();

      expect(mockWebpush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:test@example.com',
        'public-key',
        'private-key',
      );
    });
  });

  describe('getVapidPublicKey', () => {
    it('VAPID 공개 키를 반환한다', () => {
      const result = service.getVapidPublicKey();

      expect(result).toBe('public-key');
      expect(configService.getOrThrow).toHaveBeenCalledWith('VAPID_PUBLIC_KEY');
    });
  });

  describe('upsertSubscription', () => {
    const subscription: PushSubscription = {
      endpoint: 'https://example.com/push/1',
      keys: {
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      },
    };

    it('유저가 없으면 예외를 던진다', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.upsertSubscription('user-id', subscription)).rejects.toThrow(
        NotFoundException,
      );

      expect(pushSubscriptionRepository.upsert).not.toHaveBeenCalled();
    });

    it('구독 정보를 업서트한다', async () => {
      const user = { id: 'user-id' } as User;
      userRepository.findOneBy.mockResolvedValue(user);

      await service.upsertSubscription('user-id', subscription);

      expect(pushSubscriptionRepository.upsert).toHaveBeenCalledWith(
        {
          user,
          endpoint: subscription.endpoint,
          subscription,
          updatedAt: expect.any(Date),
        },
        ['endpoint'],
      );
    });
  });

  describe('removeSubscription', () => {
    it('구독이 없으면 삭제하지 않는다', async () => {
      pushSubscriptionRepository.findOne.mockResolvedValue(null);

      await service.removeSubscription('user-id', 'endpoint');

      expect(pushSubscriptionRepository.remove).not.toHaveBeenCalled();
    });

    it('구독이 있으면 삭제한다', async () => {
      const existing = { id: 'sub-id' } as PushSubscriptionEntity;
      pushSubscriptionRepository.findOne.mockResolvedValue(existing);

      await service.removeSubscription('user-id', 'endpoint');

      expect(pushSubscriptionRepository.remove).toHaveBeenCalledWith(existing);
    });
  });

  describe('sendToUser', () => {
    const payload: SendPushNotificationRequest = {
      title: 'Hello',
      body: 'World',
      url: '/home',
    };

    it('구독이 없으면 0건으로 응답한다', async () => {
      pushSubscriptionRepository.find.mockResolvedValue([]);

      const result = await service.sendToUser('user-id', payload);

      expect(result).toEqual({ sent: 0, failed: 0, removed: 0 });
      expect(mockWebpush.sendNotification).not.toHaveBeenCalled();
    });

    it('정상 전송하면 성공 카운트를 올린다', async () => {
      const subscription = {
        id: 'sub-id',
        subscription: {
          endpoint: 'https://example.com/push/1',
          keys: { p256dh: 'p256dh', auth: 'auth' },
        },
      } as PushSubscriptionEntity;

      pushSubscriptionRepository.find.mockResolvedValue([subscription]);
      mockWebpush.sendNotification.mockResolvedValue(undefined);

      const result = await service.sendToUser('user-id', payload);

      expect(mockWebpush.sendNotification).toHaveBeenCalledWith(
        subscription.subscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url,
        }),
      );
      expect(result).toEqual({ sent: 1, failed: 0, removed: 0 });
    });

    it('410/404 에러면 구독을 제거한다', async () => {
      const subscription = {
        id: 'sub-id',
        subscription: {
          endpoint: 'https://example.com/push/1',
          keys: { p256dh: 'p256dh', auth: 'auth' },
        },
      } as PushSubscriptionEntity;

      pushSubscriptionRepository.find.mockResolvedValue([subscription]);
      mockWebpush.sendNotification.mockRejectedValue({ statusCode: 410 });

      const result = await service.sendToUser('user-id', payload);

      expect(pushSubscriptionRepository.remove).toHaveBeenCalledWith(subscription);
      expect(result).toEqual({ sent: 0, failed: 1, removed: 1 });
    });

    it('기타 에러면 실패 카운트만 올린다', async () => {
      const subscription = {
        id: 'sub-id',
        subscription: {
          endpoint: 'https://example.com/push/1',
          keys: { p256dh: 'p256dh', auth: 'auth' },
        },
      } as PushSubscriptionEntity;

      pushSubscriptionRepository.find.mockResolvedValue([subscription]);
      mockWebpush.sendNotification.mockRejectedValue(new Error('send failed'));

      const result = await service.sendToUser('user-id', payload);

      expect(pushSubscriptionRepository.remove).not.toHaveBeenCalled();
      expect(result).toEqual({ sent: 0, failed: 1, removed: 0 });
    });
  });
});
