import { Test, TestingModule } from '@nestjs/testing';
import { StatController } from './stat.controller';

describe('StatController', () => {
  let controller: StatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatController],
    }).compile();

    controller = module.get<StatController>(StatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getDifficultyStats가 7일간의 데이터를 반환한다', () => {
    const result = controller.getDifficultyStats();
    expect(result).toHaveLength(7);
    expect(result[0]).toHaveProperty('마음열기');
    expect(result[0]).toHaveProperty('시작하기');
    expect(result[0]).toHaveProperty('이어가기');
    expect(result[0]).toHaveProperty('몰입하기');
    expect(result[0]).toHaveProperty('AI');
  });
});
