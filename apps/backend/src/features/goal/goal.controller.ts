import { Controller, Get } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { GoalTemplateListResponseSchema, type GoalTemplateListResponse } from '@web24/shared';

@Controller('goal')
export class GoalController {
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
}
