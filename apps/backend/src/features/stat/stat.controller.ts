import { Controller, Get, UseGuards } from '@nestjs/common';
import * as Shared from '@web24/shared';
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
}
