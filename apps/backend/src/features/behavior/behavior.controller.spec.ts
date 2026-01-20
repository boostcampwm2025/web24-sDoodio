import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorController } from './behavior.controller';
import { BehaviorService } from './behavior.service';

describe('BehaviorController', () => {
  let controller: BehaviorController;
  let service: {
    getAllBehaviors: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getAllBehaviors: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BehaviorController],
      providers: [{ provide: BehaviorService, useValue: service }],
    }).compile();

    controller = module.get<BehaviorController>(BehaviorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllBehaviors가 서비스 결과를 반환한다', async () => {
    const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
    const mock = [{ id: '1' }];
    service.getAllBehaviors.mockResolvedValue(mock);

    const result = await controller.getAllBehaviors(userId);

    expect(service.getAllBehaviors).toHaveBeenCalledWith(userId);
    expect(result).toBe(mock);
  });
});
