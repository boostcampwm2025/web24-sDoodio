import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { CreateGoalRequest } from '@web24/shared';
import { GoalService } from './goal.service';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Behavior } from '../behavior/behavior.entity';
import { Goal } from './goal.entity';
import { User } from '../user/user.entity';
import { AIBehavior } from '../behavior/ai-behavior.entity';

describe('GoalService', () => {
  type TransactionManager = {
    getRepository: (entity: Function) => unknown;
  };

  const createService = async ({
    goalRepository: goalRepositoryOverride,
    behaviorRepository: behaviorRepositoryOverride,
    todayBehaviorRepository: todayBehaviorRepositoryOverride,
    aiBehaviorRepository: aiBehaviorRepositoryOverride,
    userRepository: userRepositoryOverride,
  }: {
    goalRepository?: Record<string, unknown>;
    behaviorRepository?: Record<string, unknown>;
    todayBehaviorRepository?: Record<string, unknown>;
    aiBehaviorRepository?: Record<string, unknown>;
    userRepository?: Record<string, unknown>;
  } = {}) => {
    const goalRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      manager: { transaction: jest.fn() },
      ...goalRepositoryOverride,
    };
    const behaviorRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      ...behaviorRepositoryOverride,
    };
    const todayBehaviorRepository = {
      find: jest.fn(),
      ...todayBehaviorRepositoryOverride,
    };
    const aiBehaviorRepository = {
      find: jest.fn(),
      ...aiBehaviorRepositoryOverride,
    };
    const userRepository = {
      findOne: jest.fn(),
      ...userRepositoryOverride,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalService,
        { provide: getRepositoryToken(Goal), useValue: goalRepository },
        { provide: getRepositoryToken(Behavior), useValue: behaviorRepository },
        { provide: getRepositoryToken(TodayBehavior), useValue: todayBehaviorRepository },
        { provide: getRepositoryToken(AIBehavior), useValue: aiBehaviorRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    return {
      service: module.get<GoalService>(GoalService),
      goalRepository,
      behaviorRepository,
      todayBehaviorRepository,
      aiBehaviorRepository,
      userRepository,
    };
  };

  const request: CreateGoalRequest = {
    goalTitle: '건강',
    goalColor: 'blue',
    behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
  };

  describe('getGoals', () => {
    it('목표 목록을 반환한다', async () => {
      const user = { id: 'user-1', nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

      const goals = [
        { id: 'goal-1', title: '건강', color: 'mint', user, behaviorCount: 0 },
        { id: 'goal-2', title: '독서', color: 'beige', user, behaviorCount: 0 },
      ];
      const goalRepository = { find: jest.fn().mockResolvedValue(goals) };

      const { service } = await createService({ goalRepository, userRepository });

      await expect(service.getGoals()).resolves.toEqual(goals);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { nickname: '테스트유저' } });
      expect(goalRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: user.id } },
        }),
      );
    });

    it('유저가 없으면 NotFoundException을 던진다', async () => {
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const goalRepository = { find: jest.fn() };

      const { service } = await createService({ goalRepository, userRepository });

      await expect(service.getGoals()).rejects.toBeInstanceOf(NotFoundException);
      expect(goalRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getGoalStamps', () => {
    it('goalId로 완료된 TodayBehavior와 AIBehavior 목록을 반환한다', async () => {
      const todayBehaviors = [
        {
          id: 'tb1',
          status: 'completed',
          behavior: { id: 'b1', title: '행동 1', difficulty: '몰입하기' },
        },
        {
          id: 'tb3',
          status: 'completed',
          behavior: { id: 'b2', title: '행동 2', difficulty: '시작하기' },
        },
      ];
      const aiBehaviors = [
        { id: 'ai1', status: 'completed', title: 'AI 행동 1' },
        { id: 'ai2', status: 'completed', title: 'AI 행동 2' },
      ];

      const todayBehaviorRepository = {
        find: jest.fn().mockResolvedValue(todayBehaviors),
      };
      const aiBehaviorRepository = {
        find: jest.fn().mockResolvedValue(aiBehaviors),
      };

      const { service } = await createService({ todayBehaviorRepository, aiBehaviorRepository });

      await expect(service.getGoalStamps('goal-abc')).resolves.toEqual([
        { id: 'tb1', title: '행동 1', difficulty: '몰입하기', source: 'today' },
        { id: 'tb3', title: '행동 2', difficulty: '시작하기', source: 'today' },
        { id: 'ai1', title: 'AI 행동 1', difficulty: 'AI', source: 'ai' },
        { id: 'ai2', title: 'AI 행동 2', difficulty: 'AI', source: 'ai' },
      ]);

      expect(todayBehaviorRepository.find).toHaveBeenCalledWith({
        where: {
          behavior: {
            goal: { id: 'goal-abc' },
          },
          status: 'completed',
        },
        relations: ['behavior'],
      });
      expect(aiBehaviorRepository.find).toHaveBeenCalledWith({
        where: {
          goal: { id: 'goal-abc' },
          status: 'completed',
        },
      });
    });
  });

  describe('createGoal', () => {
    it('유저가 없으면 NotFoundException을 던진다', async () => {
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const goalRepository = { create: jest.fn(), save: jest.fn() };
      const behaviorRepository = { create: jest.fn(), save: jest.fn() };

      const manager = {
        getRepository: jest.fn((entity: Function) => {
          if (entity === User) return userRepository;
          if (entity === Goal) return goalRepository;
          if (entity === Behavior) return behaviorRepository;
          return null;
        }),
      };

      const goalRepositoryWithManager = {
        manager: {
          transaction: jest.fn((callback: (manager: TransactionManager) => Promise<unknown>) =>
            callback(manager),
          ),
        },
      };

      const { service } = await createService({ goalRepository: goalRepositoryWithManager });

      await expect(service.createGoal(request)).rejects.toBeInstanceOf(NotFoundException);
      expect(goalRepository.save).not.toHaveBeenCalled();
    });

    it('목표와 행동을 저장하고 응답을 반환한다', async () => {
      const user = { id: 'user-1', nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

      const goal = { title: request.goalTitle, color: request.goalColor, user };
      const savedGoal = {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        ...goal,
      };

      const goalRepository = {
        create: jest.fn().mockReturnValue(goal),
        save: jest.fn().mockResolvedValue(savedGoal),
      };

      const behavior = {
        title: request.behaviors[0].title,
        difficulty: request.behaviors[0].difficulty,
        goal: savedGoal,
      };
      const savedBehavior = {
        id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
        ...behavior,
      };

      const behaviorRepository = {
        create: jest.fn().mockReturnValue(behavior),
        save: jest.fn().mockResolvedValue([savedBehavior]),
      };

      const manager = {
        getRepository: jest.fn((entity: Function) => {
          if (entity === User) return userRepository;
          if (entity === Goal) return goalRepository;
          if (entity === Behavior) return behaviorRepository;
          return null;
        }),
      };

      const goalRepositoryWithManager = {
        manager: {
          transaction: jest.fn((callback: (manager: TransactionManager) => Promise<unknown>) =>
            callback(manager),
          ),
        },
      };

      const { service } = await createService({ goalRepository: goalRepositoryWithManager });

      await expect(service.createGoal(request)).resolves.toEqual({
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
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { nickname: '테스트유저' } });
      expect(goalRepository.create).toHaveBeenCalledWith({
        title: request.goalTitle,
        color: request.goalColor,
        user,
      });
      expect(goalRepository.save).toHaveBeenCalledWith(goal);
      expect(behaviorRepository.create).toHaveBeenCalledWith({
        title: request.behaviors[0].title,
        difficulty: request.behaviors[0].difficulty,
        goal: savedGoal,
      });
      expect(behaviorRepository.save).toHaveBeenCalledWith([behavior]);
    });
  });

  describe('getGoalBehaviors', () => {
    it('목표의 행동과 AI 행동 목록을 반환한다', async () => {
      const goalId = 'goal-1';
      const behaviors = [
        { id: 'b1', title: 'b1', difficulty: '몰입하기' },
        { id: 'b2', title: 'b2', difficulty: '시작하기' },
      ];
      const goal = { id: goalId, behaviors };
      const aiBehaviors = [
        { id: 'ai-1', title: 'ai 1' },
        { id: 'ai-2', title: 'ai 2' },
      ];

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(goal),
      };
      const aiBehaviorRepository = {
        find: jest.fn().mockResolvedValue(aiBehaviors),
      };

      const { service } = await createService({ goalRepository, aiBehaviorRepository });

      await expect(service.getGoalBehaviors(goalId)).resolves.toEqual([
        { id: 'b1', goalId, title: 'b1', difficulty: '몰입하기' },
        { id: 'b2', goalId, title: 'b2', difficulty: '시작하기' },
        { id: 'ai-1', goalId, title: 'ai 1', difficulty: 'AI' },
        { id: 'ai-2', goalId, title: 'ai 2', difficulty: 'AI' },
      ]);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId },
        relations: ['behaviors'],
      });
      expect(aiBehaviorRepository.find).toHaveBeenCalledWith({
        where: { goal: { id: goalId } },
      });
    });

    it('존재하지 않는 목표의 행동 목록 조회 시 NotFoundException을 던진다', async () => {
      const goalId = 'goal-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const { service } = await createService({ goalRepository });

      await expect(service.getGoalBehaviors(goalId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
