import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateGoalResponseSchema,
  type UpdateGoalRequest,
  type CreateGoalRequest,
  type CreateGoalResponse,
  type GoalStamp,
  type UpdateGoalResponse,
  UpdateGoalResponseSchema,
} from '@web24/shared';
import { Repository } from 'typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';
import { Goal } from './goal.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { AIBehavior } from '../behavior/ai-behavior.entity';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
    @InjectRepository(AIBehavior)
    private readonly aiBehaviorRepository: Repository<AIBehavior>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getGoals(userId: string): Promise<(Goal & { behaviorCount: number })[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const goals = await this.goalRepository.find({
      where: { user: { id: user.id } },
      relations: ['behaviors'],
    });

    return goals.map((goal) => ({
      ...goal,
      behaviorCount: goal.behaviors ? goal.behaviors.length : 0,
    }));
  }

  async getGoal(userId: string, goalId: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: userId } },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async getGoalBehaviors(userId: string, goalId: string): Promise<Behavior[]> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: userId } },
      relations: ['behaviors'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal.behaviors || [];
  }

  async getGoalStamps(userId: string, goalId: string): Promise<GoalStamp[]> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: userId } },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const [todayBehaviors, aiBehaviors] = await Promise.all([
      this.todayBehaviorRepository.find({
        where: {
          behavior: {
            goal: { id: goalId },
          },
          status: 'completed',
        },
        relations: ['behavior'],
      }),
      this.aiBehaviorRepository.find({
        where: {
          goal: { id: goalId },
          status: 'completed',
        },
      }),
    ]);

    const todayStamps: GoalStamp[] = todayBehaviors.map((todayBehavior) => ({
      id: todayBehavior.id,
      title: todayBehavior.behavior.title,
      difficulty: todayBehavior.behavior.difficulty,
      updatedAt: todayBehavior.updatedAt.toISOString(),
    }));

    const aiStamps: GoalStamp[] = aiBehaviors.map((aiBehavior) => ({
      id: aiBehavior.id,
      title: aiBehavior.title,
      difficulty: 'AI',
      updatedAt: aiBehavior.updatedAt.toISOString(),
    }));

    return [...todayStamps, ...aiStamps];
  }

  async createGoal(userId: string, request: CreateGoalRequest): Promise<CreateGoalResponse> {
    return this.goalRepository.manager.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({ where: { id: userId } });

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

  async updateGoal(goalId: string, request: UpdateGoalRequest): Promise<UpdateGoalResponse> {
    return this.goalRepository.manager.transaction(async (manager) => {
      const goalRepo = manager.getRepository(Goal);

      // 목표 조회
      const goal = await goalRepo.findOne({
        where: { id: goalId },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      goal.title = request.title;
      goal.color = request.color;

      const savedGoal = await goalRepo.save(goal);

      // 응답
      return UpdateGoalResponseSchema.parse({
        id: savedGoal.id,
        title: savedGoal.title,
        color: savedGoal.color,
      });
    });
  }
}
