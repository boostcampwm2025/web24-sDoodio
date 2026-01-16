import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UsePipes } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CreateGoalRequestSchema,
  GetGoalsResponse,
  type GetGoalStampsResponse,
  type GetGoalResponse,
  GoalTemplateListResponseSchema,
  type CreateGoalRequest,
  type CreateGoalResponse,
  type GoalTemplateListResponse,
} from '@web24/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { GoalService } from './goal.service';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  async getGoals(): Promise<GetGoalsResponse> {
    const goals = await this.goalService.getGoals();
    return goals.map((goal) => ({
      id: goal.id,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      title: goal.title,
      color: goal.color,
      behaviorCount: goal.behaviorCount,
    }));
  }

  @Get(':id')
  async getGoal(@Param('id', ParseUUIDPipe) id: string): Promise<GetGoalResponse> {
    const goal = await this.goalService.getGoal(id);
    return {
      id: goal.id,
      title: goal.title,
      color: goal.color,
    };
  }

  @Get(':id/behaviors')
  async getGoalBehaviors(@Param('id', ParseUUIDPipe) id: string) {
    const behaviors = await this.goalService.getGoalBehaviors(id);
    return behaviors.map((b) => ({
      id: b.id,
      title: b.title,
      difficulty: b.difficulty,
    }));
  }

  @Get(':id/stamps')
  async getGoalStamps(@Param('id', ParseUUIDPipe) id: string): Promise<GetGoalStampsResponse> {
    return this.goalService.getGoalStamps(id);
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

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGoalRequestSchema))
  async createGoal(@Body() body: CreateGoalRequest): Promise<CreateGoalResponse> {
    return this.goalService.createGoal(body);
  }
}
