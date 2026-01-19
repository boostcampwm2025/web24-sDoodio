import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { BehaviorService } from './behavior.service';

@Controller('behaviors')
@UseGuards(SessionAuthGuard)
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get('all')
  async getAllBehaviors(@UserId() userId: string) {
    return this.behaviorService.getAllBehaviors(userId);
  }
}
