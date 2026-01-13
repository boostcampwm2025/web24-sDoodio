import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'node:crypto';
import { TodayBehaviorStatus } from '@web24/shared';
import { Behavior } from './behavior.entity';
import { TodayBehavior } from './today-behavior.entity';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(Behavior)
    private readonly behaviorRepository: Repository<Behavior>,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
  ) {}

  async getTodayBehaviors() {
    const MIN = 3;
    const MAX = 12;
    const count = randomInt(MIN, MAX + 1);

    const behaviors = await this.behaviorRepository
      .createQueryBuilder('behavior')
      .leftJoinAndSelect('behavior.goal', 'goal')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();

    return behaviors.map((b) => ({
      id: b.id,
      title: b.title,
      goalTitle: b.goal.title,
      goalColor: b.goal.color,
      difficulty: b.difficulty,
      isChecked: false,
      isRecommended: false,
    }));
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

    const totalBehaviorScore = behaviors
      .filter((behavior) => behavior.difficulty !== 'AI')
      .reduce((sum, behavior) => sum + LEVEL_SCORE[behavior.difficulty], 0);

    // let todayBehaviorRatio = null;
    // todayBehaviorRatio을 구하는 로직
    const totalTodayBehaviorScore = Math.round(totalBehaviorScore * DEFAULT_TODAY_BEHAVIOR_RATIO);

    const weightsMap = behaviors
      .filter((behavior) => behavior.difficulty !== 'AI')
      .reduce((acc, behavior) => acc.set(behavior, DEFAULT_WEIGHT), new Map<Behavior, number>());

    // 가중치를 최신화할 것들을 구하는 로직
    // 구한다음에 weightsMap의 key, value 업데이트

    const selected: Behavior[] = [];
    let currTodayBehaviorScore = 0;
    while (weightsMap.size > 0 && currTodayBehaviorScore < totalTodayBehaviorScore) {
      const candidates: Behavior[] = [...weightsMap].flatMap(([k, v]) => Array(v).fill(k));
      const index = Math.floor(Math.random() * candidates.length);
      const pickedBehavior = candidates[index];

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
}
