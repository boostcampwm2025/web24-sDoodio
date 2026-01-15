import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  CreateGoalResponseSchema,
  type CreateGoalRequest,
  type CreateGoalResponse,
} from '@web24/shared';
import { DataSource } from 'typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';
import { Goal } from './goal.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';

@Injectable()
export class GoalService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getGoals(): Promise<(Goal & { behaviorCount: number })[]> {
    // MEMO: 임시로 테스트 사용자를 바탕으로 조회
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { nickname: '테스트유저' } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const goals = await this.dataSource.getRepository(Goal).find({
      where: { user: { id: user.id } },
      relations: ['behaviors'],
    });

    return goals.map((goal) => ({
      ...goal,
      behaviorCount: goal.behaviors ? goal.behaviors.length : 0,
    }));
  }

  async getGoalBehaviors(goalId: string): Promise<Behavior[]> {
    const goal = await this.dataSource.getRepository(Goal).findOne({
      where: { id: goalId },
      relations: ['behaviors'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal.behaviors || [];
  }

  async getGoalStamps(goalId: string): Promise<TodayBehavior[]> {
    return this.dataSource.getRepository(TodayBehavior).find({
      where: {
        behavior: {
          goal: { id: goalId },
        },
        status: 'completed',
      },
      relations: ['behavior'],
    });
  }

  async createGoal(request: CreateGoalRequest): Promise<CreateGoalResponse> {
    return this.dataSource.transaction(async (manager) => {
      // MEMO: 임시로 테스트 사용자를 바탕으로 조회
      const user = await manager.getRepository(User).findOne({ where: { nickname: '테스트유저' } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const goal = manager.getRepository(Goal).create({
        title: request.goalTitle,
        color: request.goalColor,
        user,
      });
      const savedGoal = await manager.getRepository(Goal).save(goal);

      const behaviors = request.behaviors.map((behavior) =>
        manager.getRepository(Behavior).create({
          title: behavior.title,
          difficulty: behavior.difficulty,
          goal: savedGoal,
        }),
      );
      const savedBehaviors = await manager.getRepository(Behavior).save(behaviors);

      return CreateGoalResponseSchema.parse({
        id: savedGoal.id,
        title: savedGoal.title,
        color: savedGoal.color,
        behaviors: savedBehaviors.map((behavior) => ({
          id: behavior.id,
          title: behavior.title,
          difficulty: behavior.difficulty,
        })),
      });
    });
  }
}
