import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { TodayBehaviorStatus } from '@web24/shared';
import { getKstDayKey } from '../../common/utils/time.utils';
import { Behavior } from './behavior.entity';
import { TodayBehavior } from './today-behavior.entity';
import { User } from '../user/user.entity';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(Behavior)
    private readonly behaviorRepository: Repository<Behavior>,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
}
