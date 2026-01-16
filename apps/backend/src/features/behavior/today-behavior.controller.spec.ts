import { Test, TestingModule } from '@nestjs/testing';
import { TodayBehaviorController } from './today-behavior.controller';
import { BehaviorService } from './behavior.service';

describe('TodayBehaviorController', () => {
  let controller: TodayBehaviorController;
  let service: {
    updateTodayBehaviorStatus: jest.Mock;
    getTodayBehaviors: jest.Mock;
    getAIBehaviors: jest.Mock;
    createAIBehaviors: jest.Mock;
    updateAIBehaviorStatus: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      updateTodayBehaviorStatus: jest.fn(),
      getTodayBehaviors: jest.fn(),
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
      const mock = [{ id: '1' }];
      service.getTodayBehaviors.mockResolvedValue(mock);

      const result = await controller.getTodayBehaviors();

      expect(service.getTodayBehaviors).toHaveBeenCalledTimes(1);
      expect(result).toBe(mock);
    });
  });

  describe('updateTodayBehaviorStatus', () => {
    it('서비스 결과를 반환한다', async () => {
      const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
      const body = { status: 'completed' as const };
      const mock = { id, status: body.status };
      service.updateTodayBehaviorStatus.mockResolvedValue(mock);

      const result = await controller.updateTodayBehaviorStatus(id, body);

      expect(service.updateTodayBehaviorStatus).toHaveBeenCalledWith(id, body.status);
      expect(result).toBe(mock);
    });
  });

  describe('getTodayAIBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const mock = [{ id: 'ai-1' }];
      service.getAIBehaviors.mockResolvedValue(mock);

      const result = await controller.getTodayAIBehaviors();

      expect(service.getAIBehaviors).toHaveBeenCalledTimes(1);
      expect(result).toBe(mock);
    });
  });

  describe('createAIBehaviors', () => {
    it('서비스 결과를 반환한다', async () => {
      const mock = [{ id: 'ai-1' }];
      service.createAIBehaviors.mockResolvedValue(mock);

      const result = await controller.createAIBehaviors();

      expect(service.createAIBehaviors).toHaveBeenCalledTimes(1);
      expect(result).toBe(mock);
    });
  });

  describe('updateAIBehaviorStatus', () => {
    it('서비스 결과를 반환한다', async () => {
      const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
      const body = { status: 'completed' as const };
      const mock = { id, status: body.status };
      service.updateAIBehaviorStatus.mockResolvedValue(mock);

      const result = await controller.updateAIBehaviorStatus(id, body);

      expect(service.updateAIBehaviorStatus).toHaveBeenCalledWith(id, body.status);
      expect(result).toBe(mock);
    });
  });
});
