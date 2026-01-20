import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Between, DataSource, In, Not, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AIBehaviorStatus, BEHAVIOR_DIFFICULTIES, TodayBehaviorStatus } from '@web24/shared';
import { getKstDayKey } from '../../common/utils/time.utils';
import { Behavior } from './behavior.entity';
import { TodayBehavior } from './today-behavior.entity';
import { User } from '../user/user.entity';
import { AIBehavior } from './ai-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { AIService } from '../ai/ai.service';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(Behavior)
    private readonly behaviorRepository: Repository<Behavior>,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
    @InjectRepository(AIBehavior)
    private readonly aiBehaviorRepository: Repository<AIBehavior>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly aiService: AIService,
  ) {}

  async getTodayBehaviors(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const todayDate = getKstDayKey();

      const user = await manager.getRepository(User).findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingTodayBehavior = await manager.getRepository(TodayBehavior).find({
        where: {
          date: todayDate,
          user: { id: user.id },
          status: Not(In(['skipped', 'ignored', 'deleted'])),
        },
        relations: { behavior: { goal: true }, user: true },
      });

      if (existingTodayBehavior.length > 0) {
        return existingTodayBehavior.map((b) => ({
          id: b.id,
          title: b.behavior.title,
          goalTitle: b.behavior.goal.title,
          goalColor: b.behavior.goal.color,
          difficulty: b.behavior.difficulty,
          isChecked: b.status === 'completed',
          isRecommended: false, // AI 추천 여부
        }));
      }

      const behaviors = await manager.getRepository(Behavior).find({
        relations: { goal: true },
        where: { goal: { user: { id: userId } } },
      });

      const extractedTodayBehavior = this.extractTodayBehaviors(behaviors);

      const toSave = extractedTodayBehavior.map((behavior) =>
        manager.getRepository(TodayBehavior).create({
          date: todayDate,
          status: 'pending',
          origin: 'system',
          user,
          behavior,
        }),
      );

      const newTodayBehaviors = await manager.getRepository(TodayBehavior).save(toSave);

      return newTodayBehaviors.map((b) => ({
        id: b.id,
        title: b.behavior.title,
        goalTitle: b.behavior.goal.title,
        goalColor: b.behavior.goal.color,
        difficulty: b.behavior.difficulty,
        isChecked: false,
        isRecommended: false,
      }));
    });
  }

  async updateTodayBehaviorStatus(userId: string, id: string, status: TodayBehaviorStatus) {
    const result = await this.todayBehaviorRepository.update(
      { id, user: { id: userId } },
      { status },
    );
    if (result.affected === 0) {
      throw new NotFoundException('TodayBehavior not found');
    }
    return { id, status };
  }

  async refreshTodayBehaviors(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const todayDate = getKstDayKey();

      // 같은 사용자에 대한 새로고침을 직렬화해 중복 생성을 방지한다.
      const user = await manager
        .getRepository(User)
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const todayBehaviorRepository = manager.getRepository(TodayBehavior);
      const behaviorRepository = manager.getRepository(Behavior);

      const existingTodayBehaviors = await todayBehaviorRepository.find({
        where: {
          date: todayDate,
          user: { id: user.id },
          status: Not(In(['deleted'])),
        },
        relations: { behavior: { goal: true }, user: true },
      });

      // 새로고침 전에 기존 pending을 skipped로 변경한다.
      await todayBehaviorRepository.update(
        { date: todayDate, user: { id: user.id }, status: 'pending' },
        { status: 'skipped' },
      );

      const behaviors = await behaviorRepository.find({
        relations: { goal: true },
      });

      const deletedTodayBehaviors = await todayBehaviorRepository.find({
        where: { date: todayDate, user: { id: user.id }, status: 'deleted' },
        relations: { behavior: true },
      });

      const deletedBehaviorIds = new Set(
        deletedTodayBehaviors.map((todayBehavior) => todayBehavior.behavior.id),
      );

      const candidateBehaviors = behaviors.filter(
        (behavior) => !deletedBehaviorIds.has(behavior.id),
      );

      const extractedTodayBehavior = this.extractTodayBehaviors(candidateBehaviors);
      if (extractedTodayBehavior.length === 0) {
        return [];
      }

      // behaviorId 기준으로 중복을 제거하고, 기존 row를 재사용한다.
      const existingByBehaviorId = new Map(
        existingTodayBehaviors.map((todayBehavior) => [todayBehavior.behavior.id, todayBehavior]),
      );

      // 새로 삽입할 today-behaviors row
      const toInsert: TodayBehavior[] = [];
      // pending으로 되돌릴 기존 today-behaviors id 목록
      const toRestoreIds: string[] = [];
      // 이번 새로고침에 포함된 기존 today-behaviors
      const selectedExisting: TodayBehavior[] = [];

      extractedTodayBehavior.forEach((behavior) => {
        const existing = existingByBehaviorId.get(behavior.id);
        if (existing) {
          // completed는 유지하고, 나머지는 pending으로 복구한다.
          if (existing.status !== 'completed') {
            toRestoreIds.push(existing.id);
            existing.status = 'pending';
          }
          selectedExisting.push(existing);
          return;
        }

        // 새로 선택된 행동은 today-behaviors row를 생성한다.
        toInsert.push(
          todayBehaviorRepository.create({
            date: todayDate,
            status: 'pending',
            origin: 'system',
            user,
            behavior,
          }),
        );
      });

      if (toRestoreIds.length > 0) {
        await todayBehaviorRepository.update({ id: In(toRestoreIds) }, { status: 'pending' });
      }

      const newTodayBehaviors =
        toInsert.length > 0 ? await todayBehaviorRepository.save(toInsert) : [];

      // TodayBehavior를 응답 형태로 매핑한다(관계 누락 시 fallback 사용).
      const mapToResponse = (todayBehavior: TodayBehavior, fallbackBehavior?: Behavior) => {
        const behavior = todayBehavior.behavior ?? fallbackBehavior;
        if (!behavior) {
          throw new NotFoundException('Behavior not found');
        }

        return {
          id: todayBehavior.id,
          title: behavior.title,
          goalTitle: behavior.goal.title,
          goalColor: behavior.goal.color,
          difficulty: behavior.difficulty,
          isChecked: todayBehavior.status === 'completed',
          isRecommended: false,
        };
      };

      return [
        ...selectedExisting.map((behavior) => mapToResponse(behavior)),
        ...newTodayBehaviors.map((behavior, index) =>
          mapToResponse(behavior, toInsert[index]?.behavior),
        ),
      ];
    });
  }

  async deleteTodayBehavior(id: string) {
    const todayBehavior = await this.todayBehaviorRepository.findOne({ where: { id } });
    if (!todayBehavior) {
      throw new NotFoundException('TodayBehavior not found');
    }
    if (todayBehavior.status === 'completed') {
      throw new BadRequestException('Completed behavior cannot be deleted');
    }

    await this.todayBehaviorRepository.update({ id }, { status: 'deleted' });
    await this.todayBehaviorRepository.softDelete({ id });
    return { id };
  }

  extractTodayBehaviors(behaviors: Behavior[]): Behavior[] {
    const LEVEL_SCORE = {
      마음열기: 1,
      시작하기: 2,
      이어가기: 3,
      몰입하기: 4,
    } as const;
    const DEFAULT_TODAY_BEHAVIOR_RATIO = 0.8;
    const DEFAULT_WEIGHT = 5;

    const nonAiBehaviors = behaviors.filter((behavior) => behavior.difficulty !== 'AI');

    const totalBehaviorScore = nonAiBehaviors.reduce(
      (sum, behavior) => sum + LEVEL_SCORE[behavior.difficulty],
      0,
    );
    // MEMO:
    // let todayBehaviorRatio = null;
    // todayBehaviorRatio을 구하는 로직을 추가
    // todayBehaviorRatio가 null 이 아니라면 아래 줄에서 DEFAULT_TODAY_BEHAVIOR_RATIO 가 아니라 todayBehaviorRatio 사용
    const totalTodayBehaviorScore = Math.round(totalBehaviorScore * DEFAULT_TODAY_BEHAVIOR_RATIO);

    const weightsMap = nonAiBehaviors.reduce(
      (acc, behavior) => acc.set(behavior, DEFAULT_WEIGHT),
      new Map<Behavior, number>(),
    );
    // MEMO:
    // 가중치를 최신화할 것들을 구하는 로직
    // 구한 다음에 weightsMap의 key, value 업데이트

    const selected: Behavior[] = [];
    let currTodayBehaviorScore = 0;
    while (weightsMap.size > 0 && currTodayBehaviorScore < totalTodayBehaviorScore) {
      const totalWeight = [...weightsMap.values()].reduce((sum, w) => sum + w, 0);
      const randomThreshold = Math.random() * totalWeight;
      let cumulativeWeight = 0;

      const entries = Array.from(weightsMap.entries());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const pickedEntry = entries.find(([_, weight]) => {
        cumulativeWeight += weight;
        return randomThreshold < cumulativeWeight;
      });

      if (!pickedEntry) break;

      const [pickedBehavior] = pickedEntry;
      const nextTodayBehaviorScore: number =
        currTodayBehaviorScore + LEVEL_SCORE[pickedBehavior.difficulty];
      if (nextTodayBehaviorScore <= totalTodayBehaviorScore) {
        selected.push(pickedBehavior);
        currTodayBehaviorScore = nextTodayBehaviorScore;
      }
      weightsMap.delete(pickedBehavior);
    }

    return selected;
  }

  async getAllBehaviors(userId: string) {
    const behaviors = await this.behaviorRepository.find({
      relations: ['goal'],
      where: { goal: { user: { id: userId } } },
    });

    return behaviors.map((b) => ({
      id: b.id,
      goalId: b.goal?.id,
      title: b.title,
      difficulty: b.difficulty,
    }));
  }

  async getAIBehaviors(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const todayDate = getKstDayKey();

      const user = await manager.getRepository(User).findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const aiBehaviors = await manager.getRepository(AIBehavior).find({
        where: { date: todayDate, user: { id: user.id } },
        relations: { goal: true },
      });

      return aiBehaviors.map((b) => ({
        id: b.id,
        title: b.title,
        goalTitle: b.goal.title,
        goalColor: b.goal.color,
        difficulty: BEHAVIOR_DIFFICULTIES[4],
        isChecked: b.status === 'completed',
        isRecommended: true,
      }));
    });
  }

  async createAIBehaviors(userId: string) {
    const now = new Date();
    const weekBefore = new Date(now);
    weekBefore.setDate(now.getDate() - 7);

    const nowDate = getKstDayKey(now);
    const weekBeforeDate = getKstDayKey(weekBefore);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingAIBehaviors = await manager.getRepository(AIBehavior).find({
        where: { date: nowDate, user: { id: user.id } },
        relations: { goal: true },
      });

      if (existingAIBehaviors.length > 0) {
        return existingAIBehaviors.map((b) => ({
          id: b.id,
          title: b.title,
          goalTitle: b.goal.title,
          goalColor: b.goal.color,
          difficulty: BEHAVIOR_DIFFICULTIES[4],
          isChecked: b.status === 'completed',
          isRecommended: true,
        }));
      }

      const weekTodayBehaviors = await manager.getRepository(TodayBehavior).find({
        where: { date: Between(weekBeforeDate, nowDate), user: { id: user.id } },
        relations: { behavior: { goal: true } },
      });

      // key: goalId, value: [goal 별 completed, goal 별 전체 갯수]
      const goalCompletionCountMap = weekTodayBehaviors.reduce((acc, tb) => {
        const goalId = tb.behavior.goal.id;

        const [completed, total] = acc.get(goalId) ?? [0, 0];
        const completedDelta = tb.status === 'completed' ? 1 : 0;

        acc.set(goalId, [completed + completedDelta, total + 1]);
        return acc;
      }, new Map<string, [number, number]>());

      const sortedGoals = Array.from(goalCompletionCountMap.entries())
        .map(([id, [completed, total]]) => ({
          id,
          completed,
          total,
          rate: total > 0 ? completed / total : 0,
        }))
        .sort((a, b) => {
          // 1순위: 완료율 내림차순
          if (b.rate !== a.rate) {
            return b.rate - a.rate;
          }
          // 2순위: 완료율이 같으면 전체 횟수(total) 내림차순
          return b.total - a.total;
        });

      let bestGoal: Goal | null = null;

      if (sortedGoals.length > 0) {
        bestGoal = await manager.getRepository(Goal).findOne({
          where: { id: sortedGoals[0].id },
          relations: { behaviors: true },
        });
      } else {
        bestGoal = await manager.getRepository(Goal).findOne({
          where: { user: { id: user.id } },
          order: { createdAt: 'DESC' },
          relations: { behaviors: true },
        });
      }

      if (!bestGoal) return [];

      const aiBehaviorTitles = await this.aiService.getAIBehaviorTitles(bestGoal);

      const toSave = aiBehaviorTitles.map((title) =>
        manager.getRepository(AIBehavior).create({
          goal: bestGoal,
          title,
          user,
          date: nowDate,
          status: 'pending',
        }),
      );

      const aiBehaviors = await manager.getRepository(AIBehavior).save(toSave);
      return aiBehaviors.map((b) => ({
        id: b.id,
        title: b.title,
        goalTitle: b.goal.title,
        goalColor: b.goal.color,
        difficulty: BEHAVIOR_DIFFICULTIES[4],
        isChecked: false,
        isRecommended: true,
      }));
    });
  }

  async updateAIBehaviorStatus(userId: string, id: string, status: AIBehaviorStatus) {
    const result = await this.aiBehaviorRepository.update({ id, user: { id: userId } }, { status });
    if (result.affected === 0) {
      throw new NotFoundException('AIBehavior not found');
    }
    return { id, status };
  }
}
