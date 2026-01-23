import { Test, TestingModule } from '@nestjs/testing';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';

describe('StatController', () => {
  let controller: StatController;

  let service: {
    getDifficultyStats: jest.Mock;
    getInsights: jest.Mock;
    getTopBehaviors: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getDifficultyStats: jest.fn(),
      getTopBehaviors: jest.fn(),
      getInsights: jest.fn(),
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

  it('getInsights가 서비스 결과를 반환한다', async () => {
    const userId = '019bd5d8-72dc-78ca-af5d-c93358058b32';
    const mock = {
      statDate: '2026-01-22',
      dailyDifficultyCompletedCounts: {
        마음열기: 1,
        시작하기: 0,
        이어가기: 0,
        몰입하기: 0,
        AI: 0,
      },
      weeklyDifficultyCompletedCounts: {
        마음열기: 1,
        시작하기: 2,
        이어가기: 3,
        몰입하기: 4,
        AI: 0,
      },
      totalDifficultyCompletedCounts: {
        마음열기: 2,
        시작하기: 3,
        이어가기: 4,
        몰입하기: 5,
        AI: 0,
      },
      originCompletedCounts: { system: 1, user: 1 },
      notDoneCounts: { system: 0, user: 0 },
      completionTimeBuckets: {
        '1~7': 0,
        '7~10': 1,
        '10~17': 0,
        '17~20': 0,
        '20~1': 0,
      },
      checkInTotal: 1,
      duduCatchTotal: 0,
      goalCountDegree: 'NEUTRAL',
      behaviorCountDegree: 'NEUTRAL',
      avgRefreshPerDay: 1,
      avgCompletedPerDay: 1,
    };
    service.getInsights.mockResolvedValue(mock);

    const result = await controller.getInsights(userId);

    expect(service.getInsights).toHaveBeenCalledWith(userId);
    expect(result).toBe(mock);
  });

  describe('getTopBehaviors', () => {
    it('userId를 전달해 StatService.getTopBehaviors를 호출하고 결과를 그대로 반환한다', async () => {
      const userId = 'user-1';
      const mockResponse = {
        all: {
          totalCount: 5,
          items: [
            {
              id: 'b1',
              behaviorTitle: '행동1',
              behaviorDifficulty: '몰입하기',
              goalTitle: '목표1',
              goalColor: '#111111',
              count: 3,
            },
            {
              id: 'b2',
              behaviorTitle: '행동2',
              behaviorDifficulty: '마음열기',
              goalTitle: '목표2',
              goalColor: '#222222',
              count: 2,
            },
          ],
        },
        goals: [
          {
            id: 'g1',
            goalTitle: '목표1',
            goalColor: '#111111',
            totalCount: 3,
            items: [
              {
                id: 'b1',
                behaviorTitle: '행동1(스냅샷)',
                behaviorDifficulty: '몰입하기',
                count: 2,
              },
              {
                id: 'b3',
                behaviorTitle: '행동3(스냅샷)',
                behaviorDifficulty: '마음열기',
                count: 1,
              },
            ],
          },
        ],
      };

      service.getTopBehaviors.mockResolvedValue(mockResponse);

      const result = await controller.getTopBehaviors(userId);

      expect(service.getTopBehaviors).toHaveBeenCalledTimes(1);
      expect(service.getTopBehaviors).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockResponse);
    });

    it('StatService.getTopBehaviors가 에러를 던지면 그대로 전파한다', async () => {
      const userId = 'user-1';
      service.getTopBehaviors.mockRejectedValue(new Error('boom'));

      await expect(controller.getTopBehaviors(userId)).rejects.toThrow('boom');
      expect(service.getTopBehaviors).toHaveBeenCalledWith(userId);
    });
  });
});
