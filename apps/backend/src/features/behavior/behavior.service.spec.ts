import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { BehaviorService } from './behavior.service';
import { Behavior } from './behavior.entity';

jest.mock('crypto', () => ({ randomInt: jest.fn() }));

describe('BehaviorService', () => {
  let service: BehaviorService;
  let repository: { createQueryBuilder: jest.Mock };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BehaviorService, { provide: getRepositoryToken(Behavior), useValue: repository }],
    }).compile();

    service = module.get<BehaviorService>(BehaviorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('랜덤 개수로 행동을 조회하고 응답을 매핑한다', async () => {
    (randomInt as jest.Mock).mockReturnValue(4);

    queryBuilder.getMany.mockResolvedValue([
      {
        id: 'b1',
        title: '물 1컵 마시기',
        difficulty: '마음열기',
        goal: { title: '건강한 생활', color: 'mint' },
      },
    ]);

    const result = await service.getTodayBehaviors();

    expect(randomInt).toHaveBeenCalledWith(3, 13);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('behavior');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('behavior.goal', 'goal');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
    expect(queryBuilder.limit).toHaveBeenCalledWith(4);

    expect(result).toEqual([
      {
        id: 'b1',
        title: '물 1컵 마시기',
        goalTitle: '건강한 생활',
        goalColor: 'mint',
        difficulty: '마음열기',
        isChecked: false,
        isRecommended: false,
      },
    ]);
  });
});
