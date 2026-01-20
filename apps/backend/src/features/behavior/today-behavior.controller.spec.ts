import { Test, TestingModule } from '@nestjs/testing';
import { TodayBehaviorController } from './today-behavior.controller';
import { BehaviorService } from './behavior.service';

describe('TodayBehaviorController', () => {
  let controller: TodayBehaviorController;
  let service: {
    updateTodayBehaviorStatus: jest.Mock;
    getTodayBehaviors: jest.Mock;
    refreshTodayBehaviors: jest.Mock;
    deleteTodayBehavior: jest.Mock;
    getAIBehaviors: jest.Mock;
    createAIBehaviors: jest.Mock;
    updateAIBehaviorStatus: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      updateTodayBehaviorStatus: jest.fn(),
      getTodayBehaviors: jest.fn(),
      refreshTodayBehaviors: jest.fn(),
      deleteTodayBehavior: jest.fn(),
      getAIBehaviors: jest.fn(),
      createAIBehaviors: jest.fn(),
      updateAIBehaviorStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodayBehaviorController],
      providers: [{ provide: BehaviorService, useValue: service }],
    }).compile();

    controller = module.get<TodayBehaviorController>(TodayBehaviorController);
  });

  describe('init', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getTodayBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const mock = [{ id: '1' }];
      service.getTodayBehaviors.mockResolvedValue(mock);

      const result = await controller.getTodayBehaviors(userId);

      expect(service.getTodayBehaviors).toHaveBeenCalledWith(userId);
      expect(result).toBe(mock);
    });
  });

  describe('refreshTodayBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const mock = [{ id: 'refreshed-1' }];
      service.refreshTodayBehaviors.mockResolvedValue(mock);

      const result = await controller.refreshTodayBehaviors('user-1');

      expect(service.refreshTodayBehaviors).toHaveBeenCalledWith('user-1');
      expect(result).toBe(mock);
    });

    it('행동이 없으면 빈 배열을 반환한다', async () => {
      service.refreshTodayBehaviors.mockResolvedValue([]);

      const result = await controller.refreshTodayBehaviors('user-1');

      expect(service.refreshTodayBehaviors).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('updateTodayBehaviorStatus', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
      const body = { status: 'completed' as const };
      const mock = { id, status: body.status };
      service.updateTodayBehaviorStatus.mockResolvedValue(mock);

      const result = await controller.updateTodayBehaviorStatus(userId, id, body);

      expect(service.updateTodayBehaviorStatus).toHaveBeenCalledWith(userId, id, body.status);
      expect(result).toBe(mock);
    });
  });

  describe('deleteTodayBehavior', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
      const mock = { id };
      service.deleteTodayBehavior.mockResolvedValue(mock);

      const result = await controller.deleteTodayBehavior(userId, id);

      expect(service.deleteTodayBehavior).toHaveBeenCalledWith(userId, id);
      expect(result).toBe(mock);
    });
  });

  describe('getTodayAIBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const mock = [{ id: 'ai-1' }];
      service.getAIBehaviors.mockResolvedValue(mock);

      const result = await controller.getTodayAIBehaviors(userId);

      expect(service.getAIBehaviors).toHaveBeenCalledWith(userId);
      expect(result).toBe(mock);
    });
  });

  describe('createAIBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const mock = [{ id: 'ai-1' }];
      service.createAIBehaviors.mockResolvedValue(mock);

      const result = await controller.createAIBehaviors(userId);

      expect(service.createAIBehaviors).toHaveBeenCalledWith(userId);
      expect(result).toBe(mock);
    });
  });

  describe('updateAIBehaviorStatus', () => {
    it('서비스 결과를 반환한다', async () => {
      const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
      const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
      const body = { status: 'completed' as const };
      const mock = { id, status: body.status };
      service.updateAIBehaviorStatus.mockResolvedValue(mock);

      const result = await controller.updateAIBehaviorStatus(userId, id, body);

      expect(service.updateAIBehaviorStatus).toHaveBeenCalledWith(userId, id, body.status);
      expect(result).toBe(mock);
    });
  });
});
