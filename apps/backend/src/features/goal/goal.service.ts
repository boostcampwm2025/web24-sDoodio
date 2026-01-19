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
  type CreateGoalBehaviorsRequest,
  type UpdateGoalBehaviorsRequest,
  type DeleteGoalBehaviorsRequest,
} from '@web24/shared';
import { In, Repository } from 'typeorm';
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
    // MEMO: 임시로 테스트 사용자를 바탕으로 조회
    const user = await this.userRepository.findOne({ where: { nickname: '테스트유저' } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: user.id } },
      relations: ['user'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    goal.title = request.title;
    goal.color = request.color;

    const savedGoal = await this.goalRepository.save(goal);

    // 응답
    return UpdateGoalResponseSchema.parse({
      id: savedGoal.id,
      title: savedGoal.title,
      color: savedGoal.color,
    });
  }

  async createGoalBehaviors(goalId: string, request: CreateGoalBehaviorsRequest): Promise<void> {
    await this.goalRepository.manager.transaction(async (manager) => {
      // MEMO: 임시로 테스트 사용자를 바탕으로 조회
      const user = await this.userRepository.findOne({ where: { nickname: '테스트유저' } });
      if (!user) {
        throw new NotFoundException('Test User not found');
      }

      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: user.id } },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      const newBehaviors = request.behaviors.map((behavior) =>
        manager.getRepository(Behavior).create({
          title: behavior.title,
          difficulty: behavior.difficulty,
          goal,
        }),
      );

      // 일괄 저장
      await manager.getRepository(Behavior).save(newBehaviors);
    });
  }

  async updateGoalBehaviors(goalId: string, request: UpdateGoalBehaviorsRequest): Promise<void> {
    await this.goalRepository.manager.transaction(async (manager) => {
      // MEMO: 임시로 테스트 사용자를 바탕으로 조회
      const user = await this.userRepository.findOne({ where: { nickname: '테스트유저' } });
      if (!user) {
        throw new NotFoundException('Test User not found');
      }

      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: user.id } },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      const updatePromises = request.behaviors.map(async (dto) => {
        const behaviorRepo = manager.getRepository(Behavior);
        const behavior = await behaviorRepo.findOne({
          where: { id: dto.id, goal: { id: goalId } },
        });

        if (!behavior) return;

        // 변경된 필드만 업데이트
        behaviorRepo.merge(behavior, {
          title: dto.title,
          difficulty: dto.difficulty,
        });
        await behaviorRepo.save(behavior);
      });

      await Promise.all(updatePromises);
    });
  }

  async deleteGoalBehaviors(goalId: string, request: DeleteGoalBehaviorsRequest): Promise<void> {
    if (request.behaviorIds.length === 0) return;

    await this.goalRepository.manager.transaction(async (manager) => {
      // MEMO: 임시로 테스트 사용자를 바탕으로 조회
      const user = await this.userRepository.findOne({ where: { nickname: '테스트유저' } });
      if (!user) {
        throw new NotFoundException('Test User not found');
      }

      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: user.id } },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      // goalId와 behaviorIds가 모두 일치하는 것만 삭제
      await manager.getRepository(Behavior).delete({
        id: In(request.behaviorIds),
        goal: { id: goalId },
      });
    });
  }
}
