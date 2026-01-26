import { Test, TestingModule } from '@nestjs/testing';
import { PushController } from './push.controller';
import { PushService } from './push.service';

describe('PushController', () => {
  let controller: PushController;
  let pushService: jest.Mocked<PushService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushController],
      providers: [
        {
          provide: PushService,
          useValue: {
            getVapidPublicKey: jest.fn(),
            upsertSubscription: jest.fn(),
            removeSubscription: jest.fn(),
            sendToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PushController>(PushController);
    pushService = module.get(PushService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVapidPublicKey', () => {
    it('서비스에서 공개 키를 받아 반환한다', () => {
      pushService.getVapidPublicKey.mockReturnValue('public-key');

      const result = controller.getVapidPublicKey();

      expect(pushService.getVapidPublicKey).toHaveBeenCalled();
      expect(result).toEqual({ publicKey: 'public-key' });
    });
  });

  describe('registerSubscription', () => {
    it('구독을 등록하고 성공 응답을 반환한다', async () => {
      const subscription = {
        endpoint: 'https://example.com/push/1',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      };
      pushService.upsertSubscription.mockResolvedValue(undefined);

      const result = await controller.registerSubscription('user-id', subscription);

      expect(pushService.upsertSubscription).toHaveBeenCalledWith('user-id', subscription);
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteSubscription', () => {
    it('구독을 삭제하고 성공 응답을 반환한다', async () => {
      const body = { endpoint: 'https://example.com/push/1' };
      pushService.removeSubscription.mockResolvedValue(undefined);

      const result = await controller.deleteSubscription('user-id', body);

      expect(pushService.removeSubscription).toHaveBeenCalledWith('user-id', body.endpoint);
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendTestNotification', () => {
    it('테스트 푸시를 전송하고 결과를 반환한다', async () => {
      const payload = { title: 'Hello', body: 'World', url: '/home' };
      pushService.sendToUser.mockResolvedValue({ sent: 1, failed: 0, removed: 0 });

      const result = await controller.sendTestNotification('user-id', payload);

      expect(pushService.sendToUser).toHaveBeenCalledWith('user-id', payload);
      expect(result).toEqual({ sent: 1, failed: 0, removed: 0 });
    });
  });
});
