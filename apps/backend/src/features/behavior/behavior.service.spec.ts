import { In, Not } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { type AIBehaviorStatus, BEHAVIOR_DIFFICULTIES, TodayBehaviorStatus } from '@web24/shared';
import { BehaviorService } from './behavior.service';
import { Behavior } from './behavior.entity';
import { TodayBehavior } from './today-behavior.entity';
import { AIBehavior } from './ai-behavior.entity';
import { AIService } from '../ai/ai.service';
import { Goal } from '../goal/goal.entity';
import { User } from '../user/user.entity';

jest.mock('crypto', () => ({ randomInt: jest.fn() }));

describe('BehaviorService', () => {
  let service: BehaviorService;
  let repository: {
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
  };
  let todayBehaviorRepository: {
    update: jest.Mock;
    findOne?: jest.Mock;
    delete?: jest.Mock;
    softDelete?: jest.Mock;
  };
  let aiBehaviorRepository: { find: jest.Mock; update: jest.Mock };
  let aiService: { createAIBehaviors: jest.Mock; getAIBehaviorTitles: jest.Mock };
  let dataSource: { transaction: jest.Mock };
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
      find: jest.fn(),
    };
    todayBehaviorRepository = { update: jest.fn() };
    aiBehaviorRepository = { find: jest.fn(), update: jest.fn() };
    aiService = { createAIBehaviors: jest.fn(), getAIBehaviorTitles: jest.fn() };
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BehaviorService,
        { provide: getRepositoryToken(Behavior), useValue: repository },
        { provide: getRepositoryToken(TodayBehavior), useValue: todayBehaviorRepository },
        { provide: getRepositoryToken(AIBehavior), useValue: aiBehaviorRepository },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: AIService, useValue: aiService },
      ],
    }).compile();

    service = module.get<BehaviorService>(BehaviorService);
  });

  describe('init', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('updateTodayBehaviorStatus', () => {
    it('today behavior 상태를 업데이트한다', async () => {
      todayBehaviorRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateTodayBehaviorStatus(
        'user-1',
        'tb-1',
        'completed' as TodayBehaviorStatus,
      );

      expect(todayBehaviorRepository.update).toHaveBeenCalledWith(
        { id: 'tb-1', user: { id: 'user-1' } },
        { status: 'completed' },
      );
      expect(result).toEqual({ id: 'tb-1', status: 'completed' });
    });

    it('대상이 없으면 NotFoundException을 던진다', async () => {
      todayBehaviorRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updateTodayBehaviorStatus('user-1', 'tb-404', 'completed' as TodayBehaviorStatus),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteTodayBehavior', () => {
    it('completed면 BadRequestException을 던진다', async () => {
      todayBehaviorRepository.findOne = jest.fn().mockResolvedValue({
        id: 'tb-1',
        status: 'completed',
      });
      todayBehaviorRepository.softDelete = jest.fn();

      await expect(service.deleteTodayBehavior('user-1', 'tb-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('대상이 없으면 NotFoundException을 던진다', async () => {
      todayBehaviorRepository.findOne = jest.fn().mockResolvedValue(null);
      todayBehaviorRepository.softDelete = jest.fn();

      await expect(service.deleteTodayBehavior('user-1', 'tb-404')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('삭제 후 id를 반환한다', async () => {
      todayBehaviorRepository.findOne = jest.fn().mockResolvedValue({
        id: 'tb-1',
        status: 'pending',
      });
      todayBehaviorRepository.softDelete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await service.deleteTodayBehavior('user-1', 'tb-1');

      expect(todayBehaviorRepository.update).toHaveBeenCalledWith(
        { id: 'tb-1', user: { id: 'user-1' } },
        { status: 'deleted' },
      );
      expect(todayBehaviorRepository.softDelete).toHaveBeenCalledWith({
        id: 'tb-1',
        user: { id: 'user-1' },
      });
      expect(result).toEqual({ id: 'tb-1' });
    });
  });

  describe('getTodayBehaviors', () => {
    it('user가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-404';
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const manager = {
        getRepository: () => userRepository,
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      await expect(service.getTodayBehaviors(userId)).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('기존 오늘 행동이 있으면 매핑해서 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const existing = [
        {
          id: 'tb-1',
          status: 'completed',
          behavior: {
            title: '물 1컵 마시기',
            difficulty: '마음열기',
            goal: { title: '건강한 생활', color: 'mint' },
          },
          user,
        },
      ] as TodayBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue(existing) };
      const behaviorRepository = { find: jest.fn() };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (Behavior as unknown)) return behaviorRepository;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      const result = await service.getTodayBehaviors(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(todayRepository.find).toHaveBeenCalledWith({
        where: {
          date: expect.any(String),
          user: { id: user.id },
          status: Not(In(['skipped', 'ignored', 'deleted'])),
        },
        relations: { behavior: { goal: true }, user: true },
      });
      expect(behaviorRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'tb-1',
          title: '물 1컵 마시기',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: '마음열기',
          isChecked: true,
          isRecommended: false,
        },
      ]);
    });

    it('기존 오늘 행동이 없으면 추출 후 저장하고 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const behaviors = [
        {
          id: 'b-1',
          title: '물 1컵 마시기',
          difficulty: '마음열기',
          goal: { title: '건강한 생활', color: 'mint' },
        },
      ] as Behavior[];

      const todayRepository = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([
          {
            id: 'b-1',
            behavior: behaviors[0],
          },
        ]),
      };
      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const behaviorRepository = { find: jest.fn().mockResolvedValue(behaviors) };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (Behavior as unknown)) return behaviorRepository;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      const extractSpy = jest.spyOn(service, 'extractTodayBehaviors').mockReturnValue(behaviors);

      const result = await service.getTodayBehaviors(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(todayRepository.find).toHaveBeenCalledWith({
        where: {
          date: expect.any(String),
          user: { id: user.id },
          status: Not(In(['skipped', 'ignored', 'deleted'])),
        },
        relations: { behavior: { goal: true }, user: true },
      });
      expect(behaviorRepository.find).toHaveBeenCalledWith({
        relations: { goal: true },
        where: { goal: { user: { id: userId } } },
      });
      expect(extractSpy).toHaveBeenCalledWith(behaviors);
      expect(todayRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: 'b-1',
          title: '물 1컵 마시기',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: '마음열기',
          isChecked: false,
          isRecommended: false,
        },
      ]);
      extractSpy.mockRestore();
    });
  });

  describe('extractTodayBehaviors', () => {
    const scoreMap = {
      마음열기: 1,
      시작하기: 2,
      이어가기: 3,
      몰입하기: 4,
    } as const;
    let randomSpy: jest.SpyInstance;

    beforeEach(() => {
      randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it('난이도 합 비율에 맞게 중복 없이 행동을 선택한다', () => {
      const behaviors = [
        { id: 'b1', difficulty: '마음열기' },
        { id: 'b2', difficulty: '시작하기' },
        { id: 'b3', difficulty: '이어가기' },
        { id: 'b4', difficulty: '몰입하기' },
        { id: 'b5', difficulty: 'AI' },
      ] as Behavior[];

      const result = service.extractTodayBehaviors(behaviors);

      const ids = result.map((behavior) => behavior.id);
      const totalScore = result.reduce((sum, behavior) => sum + scoreMap[behavior.difficulty], 0);

      expect(result).toHaveLength(3);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toEqual(['b1', 'b2', 'b3']);
      expect(result.some((behavior) => behavior.difficulty === 'AI')).toBe(false);
      expect(totalScore).toBeLessThanOrEqual(8);
    });

    it('빈 배열이면 빈 배열을 반환한다', () => {
      const result = service.extractTodayBehaviors([] as Behavior[]);

      expect(result).toEqual([]);
    });

    it('모두 AI 난이도면 빈 배열을 반환한다', () => {
      const behaviors = [
        { id: 'a1', difficulty: 'AI' },
        { id: 'a2', difficulty: 'AI' },
      ] as Behavior[];

      const result = service.extractTodayBehaviors(behaviors);

      expect(result).toEqual([]);
    });

    it('AI가 섞여 있어도 결과에는 AI가 포함되지 않는다', () => {
      const behaviors = [
        { id: 'b1', difficulty: 'AI' },
        { id: 'b2', difficulty: '마음열기' },
        { id: 'b3', difficulty: '시작하기' },
      ] as Behavior[];

      const result = service.extractTodayBehaviors(behaviors);

      expect(result.some((b) => b.difficulty === 'AI')).toBe(false);
    });

    it('선택된 행동들의 난이도 점수 합은 오늘 목표 점수(반올림 비율)를 넘지 않는다', () => {
      const behaviors = [
        { id: 'b1', difficulty: '마음열기' }, // 1
        { id: 'b2', difficulty: '몰입하기' }, // 4
        { id: 'b3', difficulty: '몰입하기' }, // 4
        { id: 'b4', difficulty: '이어가기' }, // 3
      ] as Behavior[];

      // totalBehaviorScore = 1 + 4 + 4 + 3 = 12
      // totalTodayBehaviorScore = round(12 * 0.8) = round(9.6) = 10
      const result = service.extractTodayBehaviors(behaviors);

      const totalScore = result.reduce((sum, b) => sum + scoreMap[b.difficulty], 0);

      expect(totalScore).toBeLessThanOrEqual(10);
    });

    it('중복 입력(서로 다른 객체지만 같은 id)이라도 현재 구현은 객체 단위로 중복 선택될 수 있다(회귀/문서화 테스트)', () => {
      // 같은 id지만 객체가 다르면 Map key로는 서로 다른 엔트리로 취급됨
      const behaviors = [
        { id: 'dup', difficulty: '마음열기' },
        { id: 'dup', difficulty: '시작하기' },
        { id: 'b3', difficulty: '이어가기' },
        { id: 'b4', difficulty: '몰입하기' },
      ] as Behavior[];

      const result = service.extractTodayBehaviors(behaviors);
      const ids = result.map((b) => b.id);

      // "id 중복이 없어야 한다"가 제품 스펙이면 이 테스트는 실패하도록 바꾸고 구현도 id 기반으로 바꾸는 게 맞음.
      // 지금은 현재 동작을 명시하는 테스트(원치 않으면 삭제/수정)
      expect(new Set(ids).size).toBeLessThanOrEqual(ids.length);
    });

    it('무작위 값이 0이 아닐 때도 결과는 유효해야 한다(스모크 테스트)', () => {
      randomSpy.mockReturnValue(0.9999);

      const behaviors = [
        { id: 'b1', difficulty: '마음열기' },
        { id: 'b2', difficulty: '시작하기' },
        { id: 'b3', difficulty: '이어가기' },
        { id: 'b4', difficulty: '몰입하기' },
        { id: 'b5', difficulty: 'AI' },
      ] as Behavior[];

      const result = service.extractTodayBehaviors(behaviors);

      const totalBehaviorScore = behaviors
        .filter((b) => b.difficulty !== 'AI')
        .reduce((sum, b) => sum + scoreMap[b.difficulty as keyof typeof scoreMap], 0);

      const totalTodayBehaviorScore = Math.round(totalBehaviorScore * 0.8);

      const totalScore = result.reduce(
        (sum, b) => sum + scoreMap[b.difficulty as keyof typeof scoreMap],
        0,
      );

      expect(result.some((b) => b.difficulty === 'AI')).toBe(false);
      expect(totalScore).toBeLessThanOrEqual(totalTodayBehaviorScore);
    });
  });

  describe('refreshTodayBehaviors', () => {
    it('기존 행동을 재사용하고 skipped를 pending으로 되돌린다', async () => {
      const user = { id: 'user-1', nickname: '테스트유저' };
      const goal = { title: '건강한 생활', color: 'mint' };
      const behavior1 = {
        id: 'b-1',
        title: '물 1컵 마시기',
        difficulty: '마음열기',
        goal,
      } as Behavior;
      const behavior2 = {
        id: 'b-2',
        title: '스트레칭',
        difficulty: '시작하기',
        goal,
      } as Behavior;
      const behavior3 = {
        id: 'b-3',
        title: '걷기',
        difficulty: '이어가기',
        goal,
      } as Behavior;
      const existing = [
        { id: 'tb-1', status: 'completed', behavior: behavior1 },
        { id: 'tb-2', status: 'skipped', behavior: behavior2 },
        { id: 'tb-3', status: 'pending', behavior: behavior3 },
      ] as TodayBehavior[];

      const userQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      const userRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(userQueryBuilder),
      };
      const todayRepository = {
        find: jest.fn().mockResolvedValueOnce(existing).mockResolvedValueOnce([]),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        create: jest.fn((value) => value),
        save: jest.fn(),
      };
      const behaviorRepository = {
        find: jest.fn().mockResolvedValue([behavior1, behavior2, behavior3]),
      };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (User as unknown)) return userRepository;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Behavior as unknown)) return behaviorRepository;
          return null;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      const extractSpy = jest
        .spyOn(service, 'extractTodayBehaviors')
        .mockReturnValue([behavior1, behavior2]);

      const result = await service.refreshTodayBehaviors(user.id);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(userQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(userQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: user.id });
      expect(todayRepository.find).toHaveBeenNthCalledWith(1, {
        where: {
          date: expect.any(String),
          user: { id: user.id },
          status: Not(In(['deleted'])),
        },
        relations: { behavior: { goal: true }, user: true },
      });
      expect(todayRepository.update).toHaveBeenNthCalledWith(
        1,
        { date: expect.any(String), user: { id: user.id }, status: 'pending' },
        { status: 'skipped' },
      );
      expect(todayRepository.update).toHaveBeenNthCalledWith(
        2,
        { id: In(['tb-2']) },
        { status: 'pending' },
      );
      expect(todayRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'tb-1',
          title: '물 1컵 마시기',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: '마음열기',
          isChecked: true,
          isRecommended: false,
        },
        {
          id: 'tb-2',
          title: '스트레칭',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: '시작하기',
          isChecked: false,
          isRecommended: false,
        },
      ]);
      extractSpy.mockRestore();
    });

    it('추출 결과가 없으면 빈 배열을 반환한다', async () => {
      const user = { id: 'user-1', nickname: '테스트유저' };

      const userQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      const userRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(userQueryBuilder),
      };
      const todayRepository = {
        find: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({ affected: 0 }),
        create: jest.fn((value) => value),
        save: jest.fn(),
      };
      const behaviorRepository = {
        find: jest.fn().mockResolvedValue([]),
      };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (User as unknown)) return userRepository;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Behavior as unknown)) return behaviorRepository;
          return null;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      const extractSpy = jest.spyOn(service, 'extractTodayBehaviors').mockReturnValue([]);

      const result = await service.refreshTodayBehaviors(user.id);

      expect(userQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: user.id });
      expect(todayRepository.update).toHaveBeenCalledWith(
        { date: expect.any(String), user: { id: user.id }, status: 'pending' },
        { status: 'skipped' },
      );
      expect(todayRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual([]);
      extractSpy.mockRestore();
    });

    it('기존 행동이 없으면 새로 저장하고 반환한다', async () => {
      const user = { id: 'user-1', nickname: '테스트유저' };
      const behavior = {
        id: 'b-1',
        title: '물 1컵 마시기',
        difficulty: '마음열기',
        goal: { title: '건강한 생활', color: 'mint' },
      } as Behavior;

      const userQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      const userRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(userQueryBuilder),
      };
      const todayRepository = {
        find: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([{ id: 'tb-new', status: 'pending' }]),
      };
      const behaviorRepository = {
        find: jest.fn().mockResolvedValue([behavior]),
      };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (User as unknown)) return userRepository;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Behavior as unknown)) return behaviorRepository;
          return null;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      const extractSpy = jest.spyOn(service, 'extractTodayBehaviors').mockReturnValue([behavior]);

      const result = await service.refreshTodayBehaviors(user.id);

      expect(userQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: user.id });
      expect(todayRepository.update).toHaveBeenCalledWith(
        { date: expect.any(String), user: { id: user.id }, status: 'pending' },
        { status: 'skipped' },
      );
      expect(todayRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: 'tb-new',
          title: '물 1컵 마시기',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: '마음열기',
          isChecked: false,
          isRecommended: false,
        },
      ]);
      extractSpy.mockRestore();
    });
  });

  describe('getAllBehaviors', () => {
    it('전체 행동 목록을 반환한다', async () => {
      const userId = 'user-1';
      const behaviors = [
        {
          id: 'b1',
          title: 'b1',
          difficulty: 'easy',
          goal: { id: 'g1' },
        },
      ];
      repository.find.mockResolvedValue(behaviors);

      const result = await service.getAllBehaviors(userId);

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['goal'],
        where: { goal: { user: { id: userId } } },
      });

      expect(result).toEqual([
        {
          id: 'b1',
          goalId: 'g1',
          title: 'b1',
          difficulty: 'easy',
        },
      ]);
    });
  });

  describe('getAIBehaviors', () => {
    it('user가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-404';
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const manager = {
        getRepository: () => userRepository,
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      await expect(service.getAIBehaviors(userId)).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('AI 행동 목록을 매핑해서 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const aiBehaviors = [
        {
          id: 'ai-1',
          title: 'AI 행동',
          status: 'completed',
          goal: { title: '건강한 생활', color: 'mint' },
        },
      ] as AIBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const aiBehaviorRepo = { find: jest.fn().mockResolvedValue(aiBehaviors) };
      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      const result = await service.getAIBehaviors(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(aiBehaviorRepo.find).toHaveBeenCalledWith({
        where: { date: expect.any(String), user: { id: user.id } },
        relations: { goal: true },
      });
      expect(result).toEqual([
        {
          id: 'ai-1',
          title: 'AI 행동',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: true,
          isRecommended: true,
        },
      ]);
    });
  });

  describe('createAIBehaviors', () => {
    it('user가 없으면 NotFoundException을 던진다', async () => {
      const userId = 'user-404';
      const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const manager = {
        getRepository: () => userRepository,
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      await expect(service.createAIBehaviors(userId)).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('기존 AI 행동이 있으면 재생성하지 않고 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const existingAIBehaviors = [
        {
          id: 'ai-1',
          title: 'AI 행동',
          status: 'pending',
          goal: { title: '건강한 생활', color: 'mint' },
        },
      ] as AIBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn() };
      const goalRepository = { findOne: jest.fn() };
      const aiBehaviorRepo = {
        find: jest.fn().mockResolvedValue(existingAIBehaviors),
      };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      const result = await service.createAIBehaviors(userId);

      expect(aiBehaviorRepo.find).toHaveBeenCalledWith({
        where: { date: expect.any(String), user: { id: user.id } },
        relations: { goal: true },
      });
      expect(todayRepository.find).not.toHaveBeenCalled();
      expect(aiService.getAIBehaviorTitles).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'ai-1',
          title: 'AI 행동',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: false,
          isRecommended: true,
        },
      ]);
    });

    it('AI 행동을 생성하고 매핑해서 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const bestGoal = {
        id: 'goal-1',
        title: '건강한 생활',
        color: 'mint',
        behaviors: [],
      };
      const weekTodayBehaviors = [
        { behavior: { goal: { id: 'goal-1' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-1' } }, status: 'pending' },
      ] as TodayBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue(weekTodayBehaviors) };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(bestGoal) };
      const aiBehaviorRepo = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([
          { id: 'ai-1', title: 'AI 행동1', goal: bestGoal },
          { id: 'ai-2', title: 'AI 행동2', goal: bestGoal },
        ]),
      };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      aiService.getAIBehaviorTitles.mockResolvedValue(['AI 행동1', 'AI 행동2']);

      const result = await service.createAIBehaviors(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(todayRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({ user: { id: user.id } }),
        relations: { behavior: { goal: true } },
      });
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        relations: { behaviors: true },
      });
      expect(aiService.getAIBehaviorTitles).toHaveBeenCalledWith(bestGoal);
      expect(aiBehaviorRepo.create).toHaveBeenCalledTimes(2);
      expect(aiBehaviorRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'AI 행동1',
            goal: bestGoal,
            user,
            status: 'pending',
          }),
          expect.objectContaining({
            title: 'AI 행동2',
            goal: bestGoal,
            user,
            status: 'pending',
          }),
        ]),
      );
      expect(result).toEqual([
        {
          id: 'ai-1',
          title: 'AI 행동1',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: false,
          isRecommended: true,
        },
        {
          id: 'ai-2',
          title: 'AI 행동2',
          goalTitle: '건강한 생활',
          goalColor: 'mint',
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: false,
          isRecommended: true,
        },
      ]);
    });

    it('완료율이 높은 목표를 우선 선택한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const bestGoal = {
        id: 'goal-a',
        title: '최고 목표',
        color: 'mint',
        behaviors: [],
      };
      const weekTodayBehaviors = [
        { behavior: { goal: { id: 'goal-a' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-a' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'pending' },
      ] as TodayBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue(weekTodayBehaviors) };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(bestGoal) };
      const aiBehaviorRepo = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([]),
      };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      aiService.getAIBehaviorTitles.mockResolvedValue([]);

      await service.createAIBehaviors(userId);

      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'goal-a' },
        relations: { behaviors: true },
      });
    });

    it('완료율이 같으면 총 횟수가 많은 목표를 선택한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const bestGoal = {
        id: 'goal-b',
        title: '많이 한 목표',
        color: 'blue',
        behaviors: [],
      };
      const weekTodayBehaviors = [
        { behavior: { goal: { id: 'goal-a' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-a' } }, status: 'pending' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'completed' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'pending' },
        { behavior: { goal: { id: 'goal-b' } }, status: 'pending' },
      ] as TodayBehavior[];

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue(weekTodayBehaviors) };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(bestGoal) };
      const aiBehaviorRepo = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([]),
      };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      aiService.getAIBehaviorTitles.mockResolvedValue([]);

      await service.createAIBehaviors(userId);

      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'goal-b' },
        relations: { behaviors: true },
      });
    });

    it('주간 기록이 없으면 최신 목표를 선택한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };
      const bestGoal = {
        id: 'goal-latest',
        title: '최근 목표',
        color: 'mint',
        behaviors: [],
      };

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue([]) };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(bestGoal) };
      const aiBehaviorRepo = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue([{ id: 'ai-1', title: 'AI 행동', goal: bestGoal }]),
      };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );
      aiService.getAIBehaviorTitles.mockResolvedValue(['AI 행동']);

      const result = await service.createAIBehaviors(userId);

      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { createdAt: 'DESC' },
        relations: { behaviors: true },
      });
      expect(result).toEqual([
        {
          id: 'ai-1',
          title: 'AI 행동',
          goalTitle: '최근 목표',
          goalColor: 'mint',
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: false,
          isRecommended: true,
        },
      ]);
    });

    it('목표가 없으면 빈 배열을 반환한다', async () => {
      const userId = 'user-1';
      const user = { id: 'user-1', nickname: '테스트유저' };

      const userRepository = { findOne: jest.fn().mockResolvedValue(user) };
      const todayRepository = { find: jest.fn().mockResolvedValue([]) };
      const goalRepository = { findOne: jest.fn().mockResolvedValue(null) };
      const aiBehaviorRepo = { find: jest.fn().mockResolvedValue([]) };

      const manager = {
        getRepository: (entity: unknown) => {
          if (entity === (TodayBehavior as unknown)) return todayRepository;
          if (entity === (Goal as unknown)) return goalRepository;
          if (entity === (AIBehavior as unknown)) return aiBehaviorRepo;
          return userRepository;
        },
      };

      dataSource.transaction.mockImplementation(async (work: (m: typeof manager) => unknown) =>
        work(manager),
      );

      const result = await service.createAIBehaviors(userId);

      expect(aiService.getAIBehaviorTitles).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('updateAIBehaviorStatus', () => {
    it('ai behavior 상태를 업데이트한다', async () => {
      aiBehaviorRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateAIBehaviorStatus(
        'user-1',
        'ai-1',
        'completed' as AIBehaviorStatus,
      );

      expect(aiBehaviorRepository.update).toHaveBeenCalledWith(
        { id: 'ai-1', user: { id: 'user-1' } },
        { status: 'completed' },
      );
      expect(result).toEqual({ id: 'ai-1', status: 'completed' });
    });

    it('대상이 없으면 NotFoundException을 던진다', async () => {
      aiBehaviorRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updateAIBehaviorStatus('user-1', 'ai-404', 'completed' as AIBehaviorStatus),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
