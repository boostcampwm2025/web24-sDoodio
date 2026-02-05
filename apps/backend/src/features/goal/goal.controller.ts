import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CreateGoalRequestSchema,
  UpdateGoalRequestSchema,
  GetGoalsResponse,
  type GetGoalStampsResponse,
  type GetGoalResponse,
  GoalTemplateListResponseSchema,
  type CreateGoalRequest,
  type CreateGoalResponse,
  GoalTemplateListResponse,
  type UpdateGoalRequest,
  type UpdateGoalResponse,
  CreateGoalBehaviorsRequestSchema,
  UpdateGoalBehaviorsRequestSchema,
  DeleteGoalBehaviorsRequestSchema,
  type DeleteGoalBehaviorsRequest,
  type UpdateGoalBehaviorsRequest,
  type CreateGoalBehaviorsRequest,
} from '@web24/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { GoalService } from './goal.service';

@Controller('goals')
@UseGuards(SessionAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  async getGoals(@UserId() userId: string): Promise<GetGoalsResponse> {
    const goals = await this.goalService.getGoals(userId);
    return goals.map((goal) => ({
      id: goal.id,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      title: goal.title,
      color: goal.color,
      behaviorCount: goal.behaviorCount,
      templateId: goal.templateId ?? undefined,
    }));
  }

  @Get('templates')
  async getTemplates(): Promise<GoalTemplateListResponse> {
    const filePath = join(process.cwd(), 'src/features/goal/goal-templates.ndjson');
    const raw = await readFile(filePath, 'utf-8');
    const templates = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    return GoalTemplateListResponseSchema.parse(templates);
  }

  @Get(':id')
  async getGoal(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetGoalResponse> {
    const goal = await this.goalService.getGoal(userId, id);
    return {
      id: goal.id,
      title: goal.title,
      color: goal.color,
      templateId: goal.templateId ?? undefined,
    };
  }

  @Get(':id/behaviors')
  async getGoalBehaviors(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const behaviors = await this.goalService.getGoalBehaviors(userId, id);
    return behaviors.map((b) => ({
      id: b.id,
      title: b.title,
      difficulty: b.difficulty,
    }));
  }

  @Get(':id/stamps')
  async getGoalStamps(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetGoalStampsResponse> {
    return this.goalService.getGoalStamps(userId, id);
  }

  @Post()
  async createGoal(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(CreateGoalRequestSchema)) body: CreateGoalRequest,
  ): Promise<CreateGoalResponse> {
    return this.goalService.createGoal(userId, body);
  }

  @Put(':id')
  async updateGoal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateGoalRequestSchema)) body: UpdateGoalRequest,
    @UserId() userId: string,
  ): Promise<UpdateGoalResponse> {
    return this.goalService.updateGoal(userId, id, body);
  }

  @Post(':goalId/behaviors')
  async createGoalBehaviors(
    @Param('goalId', new ParseUUIDPipe()) goalId: string,
    @Body(new ZodValidationPipe(CreateGoalBehaviorsRequestSchema))
    body: CreateGoalBehaviorsRequest,
    @UserId() userId: string,
  ): Promise<void> {
    return this.goalService.createGoalBehaviors(userId, goalId, body);
  }

  @Patch(':goalId/behaviors')
  async updateGoalBehaviors(
    @Param('goalId', new ParseUUIDPipe()) goalId: string,
    @Body(new ZodValidationPipe(UpdateGoalBehaviorsRequestSchema))
    body: UpdateGoalBehaviorsRequest,
    @UserId() userId: string,
  ): Promise<void> {
    return this.goalService.updateGoalBehaviors(userId, goalId, body);
  }

  @Delete(':goalId/behaviors')
  async deleteGoalBehaviors(
    @Param('goalId', new ParseUUIDPipe()) goalId: string,
    @Body(new ZodValidationPipe(DeleteGoalBehaviorsRequestSchema)) body: DeleteGoalBehaviorsRequest,
    @UserId() userId: string,
  ): Promise<void> {
    return this.goalService.deleteGoalBehaviors(userId, goalId, body);
  }
}
