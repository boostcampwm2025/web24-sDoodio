import { Controller, Get } from '@nestjs/common';
import { BehaviorService } from './behavior.service';

@Controller('behaviors')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get('all')
  async getAllBehaviors() {
    return this.behaviorService.getAllBehaviors();
  }
}
