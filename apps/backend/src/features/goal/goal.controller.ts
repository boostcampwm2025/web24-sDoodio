import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CreateGoalRequestSchema,
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
