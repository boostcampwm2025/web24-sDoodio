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
}
