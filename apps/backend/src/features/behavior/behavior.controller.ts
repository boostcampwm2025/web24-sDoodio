import { Controller, Get } from '@nestjs/common';
import { BehaviorService } from './behavior.service';

@Controller('behavior')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get()
  async getTodayBehaviors() {
    return this.behaviorService.getTodayBehaviors();
  }
}
