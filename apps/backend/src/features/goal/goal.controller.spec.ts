import { Test, TestingModule } from '@nestjs/testing';
import { readFile } from 'node:fs/promises';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('GoalController', () => {
  let controller: GoalController;
  let goalService: { createGoal: jest.Mock };

  beforeEach(async () => {
    goalService = {
      createGoal: jest.fn(),
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
});
