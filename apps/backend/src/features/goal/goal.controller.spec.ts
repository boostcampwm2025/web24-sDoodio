import { Test, TestingModule } from '@nestjs/testing';
import { readFile } from 'node:fs/promises';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('GoalController', () => {
  let controller: GoalController;
  let goalService: {
    createGoal: jest.Mock;
    getGoals: jest.Mock;
    getGoalBehaviors: jest.Mock;
    getGoalStamps: jest.Mock;
  };

  beforeEach(async () => {
    goalService = {
      createGoal: jest.fn(),
      getGoals: jest.fn(),
      getGoalBehaviors: jest.fn(),
      getGoalStamps: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalController],
      providers: [
        {
          provide: GoalService,
          useValue: goalService,
        },
      ],
    }).compile();

    controller = module.get<GoalController>(GoalController);
  });

  it('전체 목표 목록을 반환한다', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    goalService.getGoals.mockResolvedValue([
      {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        createdAt: now,
        updatedAt: now,
        title: '건강',
        color: 'mint',
      },
    ]);

    await expect(controller.getGoals()).resolves.toEqual([
      {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        title: '건강',
        color: 'mint',
      },
    ]);

    expect(goalService.getGoals).toHaveBeenCalledTimes(1);
  });

  it('id로 목표 스탬프 목록을 반환한다', async () => {
    const mockStamps = [
      { id: 's1', behavior: { difficulty: '몰입하기' } },
      { id: 's2', behavior: { difficulty: '시작하기' } },
    ];

    goalService.getGoalStamps.mockResolvedValue(mockStamps);

    await expect(controller.getGoalStamps('goal-abc')).resolves.toEqual([
      { id: 's1', difficulty: '몰입하기' },
      { id: 's2', difficulty: '시작하기' },
    ]);

    expect(goalService.getGoalStamps).toHaveBeenCalledWith('goal-abc');
    expect(goalService.getGoalStamps).toHaveBeenCalledTimes(1);
  });

  it('템플릿 목록을 반환한다', async () => {
    (readFile as jest.Mock).mockResolvedValue(
      [
        JSON.stringify({
          id: 'template-1',
          title: '건강',
          level: {
            마음열기: ['물 한 컵 마시기'],
            시작하기: ['스트레칭 5분'],
            이어가기: ['주 2회 운동'],
            몰입하기: ['헬스장 1시간'],
          },
        }),
        JSON.stringify({
          id: 'template-2',
          title: '공부',
          level: {
            마음열기: ['책 펼치기'],
            시작하기: ['10분 읽기'],
            이어가기: ['30분 집중'],
            몰입하기: ['1시간 정리'],
          },
        }),
      ].join('\n'),
    );

    await expect(controller.getTemplates()).resolves.toHaveLength(2);
    expect(readFile).toHaveBeenCalledWith(
      expect.stringContaining('goal-templates.ndjson'),
      'utf-8',
    );
  });

  it('createGoal은 GoalService에 위임한다', async () => {
    const response = {
      id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      title: '건강',
      color: 'blue',
      behaviors: [
        {
          id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
          title: '물 한 컵 마시기',
          difficulty: '마음열기',
        },
      ],
    };
    goalService.createGoal.mockResolvedValue(response);

    await expect(
      controller.createGoal({
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      }),
    ).resolves.toEqual(response);
    expect(goalService.createGoal).toHaveBeenCalledWith({
      goalTitle: '건강',
      goalColor: 'blue',
      behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
    });
  });

  it('목표의 행동 목록을 반환한다', async () => {
    const goalId = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
    const behaviorId = '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e';
    const behaviors = [{ id: behaviorId, title: 'b1', difficulty: 'easy', extra: 'ignored' }];
    goalService.getGoalBehaviors.mockResolvedValue(behaviors);

    await expect(controller.getGoalBehaviors(goalId)).resolves.toEqual([
      { id: behaviorId, title: 'b1', difficulty: 'easy' },
    ]);
    expect(goalService.getGoalBehaviors).toHaveBeenCalledWith(goalId);
  });
});
