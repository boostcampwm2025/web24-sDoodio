import { Test, TestingModule } from '@nestjs/testing';
import { TodayBehaviorController } from './today-behavior.controller';
import { BehaviorService } from './behavior.service';

describe('TodayBehaviorController', () => {
  let controller: TodayBehaviorController;
  let service: { updateTodayBehaviorStatus: jest.Mock; getTodayBehaviors: jest.Mock };

  beforeEach(async () => {
    service = { updateTodayBehaviorStatus: jest.fn(), getTodayBehaviors: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodayBehaviorController],
      providers: [{ provide: BehaviorService, useValue: service }],
    }).compile();

    controller = module.get<TodayBehaviorController>(TodayBehaviorController);
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

  it('updateTodayBehaviorStatus가 서비스 결과를 반환한다', async () => {
    const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
    const body = { status: 'completed' as const };
    const mock = { id, status: body.status };
    service.updateTodayBehaviorStatus.mockResolvedValue(mock);

    const result = await controller.updateTodayBehaviorStatus(id, body);

    expect(service.updateTodayBehaviorStatus).toHaveBeenCalledWith(id, body.status);
    expect(result).toBe(mock);
  });
});
