import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorController } from './behavior.controller';
import { BehaviorService } from './behavior.service';

describe('BehaviorController', () => {
  let controller: BehaviorController;
  let service: { getTodayBehaviors: jest.Mock };

  beforeEach(async () => {
    service = { getTodayBehaviors: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BehaviorController],
      providers: [{ provide: BehaviorService, useValue: service }],
    }).compile();

    controller = module.get<BehaviorController>(BehaviorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getTodayBehaviors가 서비스 결과를 반환한다', async () => {
    const mock = [{ id: '1' }];
    service.getTodayBehaviors.mockResolvedValue(mock);

    const result = await controller.getTodayBehaviors();

    expect(service.getTodayBehaviors).toHaveBeenCalledTimes(1);
    expect(result).toBe(mock);
  });
});
