import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  GOAL_ERROR_MESSAGES,
  BEHAVIOR_DIFFICULTIES,
} from '@web24/shared';
import { In, Repository } from 'typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';
import { Goal } from './goal.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { AIBehavior } from '../behavior/ai-behavior.entity';
import { getKstDayKey } from '../../common/utils/time.utils';

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
      templateId: goal.templateId ?? undefined,
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
    const requiredDifficulties = BEHAVIOR_DIFFICULTIES.filter((d) => d !== 'AI');
    const difficultySet = new Set();
    const behaviorNameSet = new Set();
    request.behaviors.forEach((b) => {
      difficultySet.add(b.difficulty);
      behaviorNameSet.add(b.title);
    });
    if (difficultySet.size < requiredDifficulties.length)
      throw new BadRequestException(GOAL_ERROR_MESSAGES.empty_actions_by_difficulty);
    if (behaviorNameSet.size < request.behaviors.length)
      throw new BadRequestException(GOAL_ERROR_MESSAGES.duplicate_action_title_in_goal);

    return this.goalRepository.manager.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const duplicatedGoal = await manager.getRepository(Goal).findOne({
        where: { title: request.goalTitle.trim(), user: { id: userId } },
      });
      if (duplicatedGoal) {
        throw new BadRequestException(GOAL_ERROR_MESSAGES.duplicate_goal_title);
      }

      const goal = manager.getRepository(Goal).create({
        title: request.goalTitle,
        color: request.goalColor,
        templateId: request.templateId,
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
        templateId: savedGoal.templateId ?? undefined,
        behaviors: savedBehaviors.map((behavior) => ({
          id: behavior.id,
          title: behavior.title,
          difficulty: behavior.difficulty,
        })),
      });
    });
  }

  async updateGoal(
    userId: string,
    goalId: string,
    request: UpdateGoalRequest,
  ): Promise<UpdateGoalResponse> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: userId } },
      relations: ['user'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    goal.title = request.title;
    goal.color = request.color;

    const savedGoal = await this.goalRepository.save(goal);

    return UpdateGoalResponseSchema.parse({
      id: savedGoal.id,
      title: savedGoal.title,
      color: savedGoal.color,
    });
  }

  async createGoalBehaviors(
    userId: string,
    goalId: string,
    request: CreateGoalBehaviorsRequest,
  ): Promise<void> {
    await this.goalRepository.manager.transaction(async (manager) => {
      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: userId } },
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

  async updateGoalBehaviors(
    userId: string,
    goalId: string,
    request: UpdateGoalBehaviorsRequest,
  ): Promise<void> {
    await this.goalRepository.manager.transaction(async (manager) => {
      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: userId } },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      const behaviorIds = request.behaviors.map((b) => b.id);

      if (behaviorIds.length === 0) {
        throw new NotFoundException('No behaviors provided');
      }

      const behaviorRepo = manager.getRepository(Behavior);

      const behaviors = await behaviorRepo.find({
        where: {
          id: In(behaviorIds),
          goal: { id: goalId },
        },
      });

      // id -> dto 매핑
      const behaviorMap = new Map(request.behaviors.map((dto) => [dto.id, dto]));

      const updatedBehaviors = behaviors.map((behavior) => {
        const dto = behaviorMap.get(behavior.id);
        if (!dto) return behavior;

        return behaviorRepo.merge(behavior, {
          title: dto.title,
          difficulty: dto.difficulty,
        });
      });

      await behaviorRepo.save(updatedBehaviors);
    });
  }

  async deleteGoalBehaviors(
    userId: string,
    goalId: string,
    request: DeleteGoalBehaviorsRequest,
  ): Promise<void> {
    if (request.behaviorIds.length === 0) return;

    await this.goalRepository.manager.transaction(async (manager) => {
      const goal = await this.goalRepository.findOne({
        where: { id: goalId, user: { id: userId } },
        relations: ['user'],
      });

      if (!goal) {
        throw new NotFoundException('Goal not found');
      }

      // goalId와 behaviorIds가 모두 일치하는 것만 삭제
      await manager.getRepository(Behavior).softDelete({
        id: In(request.behaviorIds),
        goal: { id: goalId },
      });

      // 오늘 행동에 포함된 삭제 대상은 status를 deleted로 변경
      const todayDate = getKstDayKey();
      await manager.getRepository(TodayBehavior).update(
        {
          behavior: { id: In(request.behaviorIds) },
          user: { id: userId },
          date: todayDate,
          status: In(['pending', 'skipped', 'ignored', 'completed']),
        },
        { status: 'deleted' },
      );
    });
  }
}
