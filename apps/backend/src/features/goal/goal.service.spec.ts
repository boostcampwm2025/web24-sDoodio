import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
    behaviors: [
      { title: '물 한 컵 마시기', difficulty: '마음열기' },
      { title: '스트레칭 5분', difficulty: '시작하기' },
      { title: '산책 20분', difficulty: '이어가기' },
      { title: '러닝 30분', difficulty: '몰입하기' },
    ],
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

  describe('getGoal', () => {
    it('goalId와 userId로 목표를 반환한다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-1';
      const goal = { id: goalId, title: '건강', color: 'blue' };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(goal) };

      const { service } = await createService({ goalRepository });

      await expect(service.getGoal(userId, goalId)).resolves.toEqual(goal);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, user: { id: userId } },
      });
    });

    it('목표가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-1';
      const goalRepository = { findOne: jest.fn().mockResolvedValue(null) };

      const { service } = await createService({ goalRepository });

      await expect(service.getGoal(userId, goalId)).rejects.toBeInstanceOf(NotFoundException);
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

    it('필수 난이도가 누락되면 BadRequestException을 던진다', async () => {
      const userId = 'user-1';
      const incompleteRequest: CreateGoalRequest = {
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      };

      const { service } = await createService();

      await expect(service.createGoal(userId, incompleteRequest)).rejects.toThrow(
        expect.objectContaining({ status: 400 }),
      );
    });

    it('행동 제목이 중복되면 BadRequestException을 던진다', async () => {
      const userId = 'user-1';
      const duplicatedRequest: CreateGoalRequest = {
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [
          { title: '물 한 컵 마시기', difficulty: '마음열기' },
          { title: '물 한 컵 마시기', difficulty: '시작하기' },
          { title: '산책 20분', difficulty: '이어가기' },
          { title: '러닝 30분', difficulty: '몰입하기' },
        ],
      };

      const { service } = await createService();

      await expect(service.createGoal(userId, duplicatedRequest)).rejects.toThrow(
        expect.objectContaining({ status: 400 }),
      );
    });

    it('목표 제목이 중복되면 BadRequestException을 던진다', async () => {
      const userId = 'user-1';
      const user = { id: userId, nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 'existing-goal' }),
      };

      const manager = {
        getRepository: jest.fn((entity: Function) => {
          if (entity === User) return userRepository;
          if (entity === Goal) return goalRepository;
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

      await expect(service.createGoal(userId, request)).rejects.toThrow(
        expect.objectContaining({ status: 400 }),
      );
    });

    it('목표와 행동을 저장하고 응답을 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: userId, nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

      const goal = {
        title: request.goalTitle,
        color: request.goalColor,
        templateId: undefined,
        user,
      };
      const savedGoal = {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        ...goal,
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(goal),
        save: jest.fn().mockResolvedValue(savedGoal),
      };

      const behaviorRepository = {
        create: jest.fn().mockImplementation((b) => b),
        save: jest.fn(async (arr) =>
          arr.map((b, i) => ({
            id: `01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6${i + 1}`,
            ...b,
          })),
        ),
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

      const result = await service.createGoal(userId, request);

      expect(result).toEqual({
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        title: '건강',
        color: 'blue',
        templateId: undefined,
        behaviors: request.behaviors.map((b, i) => ({
          id: `01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6${i + 1}`,
          title: b.title,
          difficulty: b.difficulty,
        })),
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { title: request.goalTitle.trim(), user: { id: userId } },
      });
      expect(goalRepository.create).toHaveBeenCalledWith({
        title: request.goalTitle,
        color: request.goalColor,
        templateId: undefined,
        user,
      });
      expect(goalRepository.save).toHaveBeenCalledWith(goal);
      expect(behaviorRepository.save).toHaveBeenCalledWith(
        request.behaviors.map((b) => ({
          title: b.title,
          difficulty: b.difficulty,
          goal: savedGoal,
        })),
      );
    });

    it('templateId가 포함된 목표를 저장하고 응답을 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: userId, nickname: '테스트유저' };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const templateId = 'template-123';
      const requestWithTemplate = { ...request, templateId };

      const goal = {
        title: requestWithTemplate.goalTitle,
        color: requestWithTemplate.goalColor,
        templateId: requestWithTemplate.templateId,
        user,
      };
      const savedGoal = {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        ...goal,
      };

      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(goal),
        save: jest.fn().mockResolvedValue(savedGoal),
      };

      const behaviorRepository = {
        create: jest.fn().mockImplementation((b) => b),
        save: jest.fn().mockResolvedValue([]),
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

      const result = await service.createGoal(userId, requestWithTemplate);

      expect(result.templateId).toBe(templateId);
      expect(goalRepository.create).toHaveBeenCalledWith(expect.objectContaining({ templateId }));
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

    it('updateGoal: 목표가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-1';
      const goalId = 'goal-1';
      const goalRepository = { findOne: jest.fn().mockResolvedValue(null) };

      const { service } = await createService({ goalRepository });

      const updateRequest: UpdateGoalRequest = { title: '제목', color: 'blue' };

      await expect(service.updateGoal(userId, goalId, updateRequest)).rejects.toBeInstanceOf(
        NotFoundException,
      );
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

    it('createGoalBehaviors: 목표가 없으면 NotFoundException을 던진다', async () => {
      const goalId = 'goal-1';
      const userId = 'user-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        manager: { transaction: jest.fn((cb) => cb({})) },
      };

      const { service } = await createService({ goalRepository });

      await expect(
        service.createGoalBehaviors(userId, goalId, { behaviors: [] }),
      ).rejects.toBeInstanceOf(NotFoundException);
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

    it('updateGoalBehaviors: 목표가 없으면 NotFoundException을 던진다', async () => {
      const goalId = 'goal-1';
      const userId = 'user-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        manager: { transaction: jest.fn((cb) => cb({})) },
      };

      const { service } = await createService({ goalRepository });

      await expect(
        service.updateGoalBehaviors(userId, goalId, {
          behaviors: [{ id: 'b1', title: 't', difficulty: '시작하기' }],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updateGoalBehaviors: 행동이 제공되지 않으면 NotFoundException을 던진다', async () => {
      const goalId = 'goal-1';
      const userId = 'user-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue({ id: goalId }),
        manager: { transaction: jest.fn((cb) => cb({})) },
      };

      const { service } = await createService({ goalRepository });

      await expect(service.updateGoalBehaviors(userId, goalId, { behaviors: [] })).rejects.toThrow(
        expect.objectContaining({ status: 404 }),
      );
    });

    it('deleteGoalBehaviors: 행동 soft delete', async () => {
      const goalId = 'goal-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { id: goalId, user };

      const behaviorRepoMock = {
        softDelete: jest.fn(),
      };

      const managerMock = {
        getRepository: jest.fn(() => behaviorRepoMock),
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
    });

    it('deleteGoalBehaviors: 목표가 없으면 NotFoundException을 던진다', async () => {
      const goalId = 'goal-1';
      const userId = 'user-1';
      const goalRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        manager: { transaction: jest.fn((cb) => cb({})) },
      };

      const { service } = await createService({ goalRepository });

      await expect(
        service.deleteGoalBehaviors(userId, goalId, { behaviorIds: ['b1'] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
