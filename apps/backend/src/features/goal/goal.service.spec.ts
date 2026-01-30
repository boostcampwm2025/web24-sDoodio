import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import type {
  CreateGoalBehaviorsRequest,
  CreateGoalRequest,
  DeleteGoalBehaviorsRequest,
  UpdateGoalBehaviorsRequest,
  UpdateGoalRequest,
} from '@web24/shared';
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
      const userId = 'user-1';
      const user = { id: userId, nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

      const goals = [
        { id: 'goal-1', title: '건강', color: 'mint', user, behaviorCount: 0 },
        { id: 'goal-2', title: '독서', color: 'beige', user, behaviorCount: 0 },
      ];
      const goalRepository = { find: jest.fn().mockResolvedValue(goals) };

      const { service } = await createService({ goalRepository, userRepository });

      await expect(service.getGoals(userId)).resolves.toEqual(goals);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(goalRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: user.id } },
        }),
      );
    });

    it('유저가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-1';
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const goalRepository = { find: jest.fn() };

      const { service } = await createService({ goalRepository, userRepository });

      await expect(service.getGoals(userId)).rejects.toBeInstanceOf(NotFoundException);
      expect(goalRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getGoalStamps', () => {
    it('goalId로 완료된 TodayBehavior와 AIBehavior 목록을 반환한다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-abc';
      const goalRepository = { findOne: jest.fn().mockResolvedValue({ id: goalId }) };
      const todayBehaviors = [
        {
          id: 'tb1',
          status: 'completed',
          behavior: { id: 'b1', title: '행동 1', difficulty: '몰입하기' },
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          id: 'tb3',
          status: 'completed',
          behavior: { id: 'b2', title: '행동 2', difficulty: '시작하기' },
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ];
      const aiBehaviors = [
        {
          id: 'ai1',
          status: 'completed',
          title: 'AI 행동 1',
          updatedAt: new Date('2024-01-03T00:00:00.000Z'),
        },
        {
          id: 'ai2',
          status: 'completed',
          title: 'AI 행동 2',
          updatedAt: new Date('2024-01-04T00:00:00.000Z'),
        },
      ];

      const todayBehaviorRepository = {
        find: jest.fn().mockResolvedValue(todayBehaviors),
      };
      const aiBehaviorRepository = {
        find: jest.fn().mockResolvedValue(aiBehaviors),
      };

      const { service } = await createService({
        goalRepository,
        todayBehaviorRepository,
        aiBehaviorRepository,
      });

      await expect(service.getGoalStamps(userId, goalId)).resolves.toEqual([
        {
          id: 'tb1',
          title: '행동 1',
          difficulty: '몰입하기',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'tb3',
          title: '행동 2',
          difficulty: '시작하기',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'ai1',
          title: 'AI 행동 1',
          difficulty: 'AI',
          updatedAt: '2024-01-03T00:00:00.000Z',
        },
        {
          id: 'ai2',
          title: 'AI 행동 2',
          difficulty: 'AI',
          updatedAt: '2024-01-04T00:00:00.000Z',
        },
      ]);

      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, user: { id: userId } },
      });
      expect(todayBehaviorRepository.find).toHaveBeenCalledWith({
        where: {
          behavior: {
            goal: { id: goalId },
          },
          status: 'completed',
        },
        relations: ['behavior'],
      });
      expect(aiBehaviorRepository.find).toHaveBeenCalledWith({
        where: {
          goal: { id: goalId },
          status: 'completed',
        },
      });
    });
  });

  describe('createGoal', () => {
    it('유저가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-1';
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

      await expect(service.createGoal(userId, request)).rejects.toBeInstanceOf(NotFoundException);
      expect(goalRepository.save).not.toHaveBeenCalled();
    });

    it('목표와 행동을 저장하고 응답을 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: userId, nickname: '테스트유저' };
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

      await expect(service.createGoal(userId, request)).resolves.toEqual({
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
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
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
    it('목표의 행동 목록을 반환한다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-1';
      const behaviors = [
        { id: 'b1', title: 'b1', difficulty: 'easy' },
        { id: 'b2', title: 'b2', difficulty: 'hard' },
      ];
      const goal = { id: goalId, behaviors };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(goal),
      };

      const { service } = await createService({ goalRepository });

      await expect(service.getGoalBehaviors(userId, goalId)).resolves.toEqual(behaviors);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, user: { id: userId } },
        relations: ['behaviors'],
      });
    });

    it('존재하지 않는 목표의 행동 목록 조회 시 NotFoundException을 던진다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const { service } = await createService({ goalRepository });

      await expect(service.getGoalBehaviors(userId, goalId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateGoal & behaviors', () => {
    it('updateGoal: 목표 업데이트 후 반환', async () => {
      const goalId = '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c55';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { id: goalId, title: '기존 목표', color: 'red', user };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(user),
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(goal),
        save: jest.fn().mockImplementation((g) => Promise.resolve(g)),
      };

      const { service } = await createService({ goalRepository, userRepository });

      const request2: UpdateGoalRequest = {
        title: '업데이트된 목표',
        color: 'blue',
      };

      const result = await service.updateGoal(user.id, goalId, request2);

      expect(result).toEqual({
        id: goalId,
        title: '업데이트된 목표',
        color: 'blue',
      });

      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, user: { id: user.id } },
        relations: ['user'],
      });

      expect(goalRepository.save).toHaveBeenCalledWith({
        ...goal,
        title: '업데이트된 목표',
        color: 'blue',
      });
    });

    it('createGoalBehaviors: 새로운 행동 생성', async () => {
      const goalId = 'goal-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { id: goalId, user };

      const behaviorRepoMock = {
        create: jest.fn((data) => data),
        save: jest.fn(),
      };

      const managerMock = {
        getRepository: jest.fn(() => behaviorRepoMock),
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(user),
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(goal),
        manager: {
          transaction: jest.fn((cb) => cb(managerMock)),
        },
      };

      const { service } = await createService({ goalRepository, userRepository });

      const request3: CreateGoalBehaviorsRequest = {
        behaviors: [{ title: '물 1컵 마시기', difficulty: '마음열기' }],
      };

      await service.createGoalBehaviors(user.id, goalId, request3);

      expect(behaviorRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '물 1컵 마시기',
          difficulty: '마음열기',
          goal: expect.objectContaining({ id: goalId }),
        }),
      );

      expect(behaviorRepoMock.save).toHaveBeenCalledWith([
        {
          title: '물 1컵 마시기',
          difficulty: '마음열기',
          goal,
        },
      ]);
    });

    it('updateGoalBehaviors: 행동 업데이트', async () => {
      const goalId = 'goal-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { id: goalId, user };

      const existingBehavior = {
        id: 'b1',
        title: '기존 행동',
        difficulty: '마음열기',
        goal,
      };

      const behaviorRepoMock = {
        find: jest.fn().mockResolvedValue([existingBehavior]),
        merge: jest.fn((entity, dto) => Object.assign(entity, dto)),
        save: jest.fn(),
      };

      const managerMock = {
        getRepository: jest.fn(() => behaviorRepoMock),
      };

      const goalRepository = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(user) // 사용자 조회
          .mockResolvedValueOnce(goal), // 목표 조회
        manager: {
          transaction: jest.fn((cb) => cb(managerMock)),
        },
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(user),
      };

      const { service } = await createService({ goalRepository, userRepository });

      const request4: UpdateGoalBehaviorsRequest = {
        behaviors: [{ id: 'b1', title: '수정된 행동', difficulty: '시작하기' }],
      };

      await service.updateGoalBehaviors(user.id, goalId, request4);

      expect(behaviorRepoMock.find).toHaveBeenCalledWith({
        where: {
          id: expect.anything(), // In(['b1'])
          goal: { id: goalId },
        },
      });

      expect(behaviorRepoMock.save).toHaveBeenCalledWith([
        {
          ...existingBehavior,
          title: '수정된 행동',
          difficulty: '시작하기',
        },
      ]);
    });

    it('deleteGoalBehaviors: 행동 soft delete', async () => {
      const goalId = 'goal-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { id: goalId, user };

      const behaviorRepoMock = {
        softDelete: jest.fn(),
      };
      const todayBehaviorRepoMock = {
        update: jest.fn(),
      };

      const managerMock = {
        getRepository: jest.fn((entity) => {
          if (entity === Behavior) return behaviorRepoMock;
          if (entity === TodayBehavior) return todayBehaviorRepoMock;
          return behaviorRepoMock;
        }),
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(goal),
        manager: {
          transaction: jest.fn((cb) => cb(managerMock)),
        },
      };

      const userRepository = {
        findOne: jest.fn().mockResolvedValue(user),
      };

      const { service } = await createService({ goalRepository, userRepository });

      const request5: DeleteGoalBehaviorsRequest = {
        behaviorIds: ['b1', 'b2'],
      };

      await service.deleteGoalBehaviors(user.id, goalId, request5);

      expect(behaviorRepoMock.softDelete).toHaveBeenCalledWith({
        id: expect.anything(),
        goal: { id: goalId },
      });
      expect(todayBehaviorRepoMock.update).toHaveBeenCalledWith(
        {
          behavior: { id: In(request5.behaviorIds) },
          user: { id: user.id },
          date: expect.any(String),
          status: In(['pending', 'skipped', 'ignored', 'completed']),
        },
        { status: 'deleted' },
      );
    });
  });
});
