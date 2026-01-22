import { Test, TestingModule } from '@nestjs/testing';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';

describe('StatController', () => {
  let controller: StatController;
  let service: { getDifficultyStats: jest.Mock };

  beforeEach(async () => {
    service = {
      getDifficultyStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatController],
      providers: [{ provide: StatService, useValue: service }],
    }).compile();

    controller = module.get<StatController>(StatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getDifficultyStats가 서비스 결과를 반환한다', async () => {
    const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
    const mock = [{ 마음열기: 1, 시작하기: 2, 이어가기: 0, 몰입하기: 0, AI: 0 }];
    service.getDifficultyStats.mockResolvedValue(mock);

    const result = await controller.getDifficultyStats(userId);

    expect(service.getDifficultyStats).toHaveBeenCalledWith(userId);
    expect(result).toBe(mock);
  });
});
