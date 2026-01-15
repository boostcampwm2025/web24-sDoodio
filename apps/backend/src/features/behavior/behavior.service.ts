import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, DataSource, In, Not, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BEHAVIOR_DIFFICULTIES, TodayBehaviorStatus } from '@web24/shared';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly aiService: AIService,
  ) {}

  async getTodayBehaviors() {
    return this.dataSource.transaction(async (manager) => {
      const todayDate = getKstDayKey();

      const user = await manager.getRepository(User).findOne({ where: { nickname: '테스트유저' } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingTodayBehavior = await manager.getRepository(TodayBehavior).find({
        where: { date: todayDate, user: { id: user.id }, status: Not(In(['skipped', 'ignored'])) },
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

  async updateTodayBehaviorStatus(id: string, status: TodayBehaviorStatus) {
    const result = await this.todayBehaviorRepository.update({ id }, { status });
    if (result.affected === 0) {
      throw new NotFoundException('TodayBehavior not found');
    }
    return { id, status };
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

  async getAllBehaviors() {
    const behaviors = await this.behaviorRepository.find({
      relations: ['goal'],
    });

    return behaviors.map((b) => ({
      id: b.id,
      goalId: b.goal?.id,
      title: b.title,
      difficulty: b.difficulty,
    }));
  }

  async getAIBehaviors() {
    return this.dataSource.transaction(async (manager) => {
      const todayDate = getKstDayKey();

      const user = await manager.getRepository(User).findOne({ where: { nickname: '테스트유저' } });
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

  async createAIBhaviors() {
    const now = new Date();
    const weekBefore = new Date(now);
    weekBefore.setDate(now.getDate() - 7);

    const nowDate = getKstDayKey(now);
    const weekBeforeDate = getKstDayKey(weekBefore);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({ where: { nickname: '테스트유저' } });
      if (!user) {
        throw new NotFoundException('User not found');
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
          rate: completed / total,
        }))
        .sort((a, b) => {
          // 1순위: 완료율 내림차순
          if (b.rate !== a.rate) {
            return b.rate - a.rate;
          }
          // 2순위: 완료율이 같으면 전체 횟수(total) 내림차순
          return b.total - a.total;
        });

      const bestGoal = await manager.getRepository(Goal).findOne({
        where: { id: sortedGoals[0].id }, // 가장 첫 번째 요소가 최고점
        relations: { behaviors: true },
      });
      if (!bestGoal) throw new NotFoundException('Goal');

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
}
