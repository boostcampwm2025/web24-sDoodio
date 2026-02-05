import { Controller, Get, UseGuards } from '@nestjs/common';
import * as Shared from '@web24/shared';
import { GetTotalCompletedCountResponse, type GetTopBehaviorsStatResponse } from '@web24/shared';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { StatService } from './stat.service';

@Controller('stats')
@UseGuards(SessionAuthGuard)
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get('difficulty')
  getDifficultyStats(@UserId() userId: string): Promise<Shared.GetDifficultyStatsResponse> {
    return this.statService.getDifficultyStats(userId);
  }

  @Get('insights')
  getInsights(@UserId() userId: string): Promise<Shared.GetStatInsightsResponse> {
    return this.statService.getInsights(userId);
  }

  @Get('total-completed-count')
  async getTotalCompletedCounts(@UserId() userId: string): Promise<GetTotalCompletedCountResponse> {
    const count = await this.statService.getTotalCompletedCounts(userId);
    return { count: Number(count) };
  }

  @Get('top-behaviors')
  async getTopBehaviors(@UserId() userId: string): Promise<GetTopBehaviorsStatResponse> {
    return this.statService.getTopBehaviors(userId);
  }
}
