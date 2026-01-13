import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CreateGoalRequestSchema,
  GetGoalsResponse,
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

  @Get(':id/behaviors')
  async getGoalBehaviors(@Param('id') id: string) {
    // TODO: Response Schema Definition needed in shared
    const behaviors = await this.goalService.getGoalBehaviors(id);
    return behaviors.map((b) => ({
      id: b.id,
      title: b.title,
      difficulty: b.difficulty,
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

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGoalRequestSchema))
  async createGoal(@Body() body: CreateGoalRequest): Promise<CreateGoalResponse> {
    return this.goalService.createGoal(body);
  }
}
