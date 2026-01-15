import { Get, Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  type GetAIBehaviorResponse,
  type PatchTodayBehaviorStatusRequest,
  PatchTodayBehaviorStatusRequestSchema,
  PatchTodayBehaviorStatusResponse,
} from '@web24/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BehaviorService } from './behavior.service';

@Controller('today-behaviors')
export class TodayBehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get()
  async getTodayBehaviors() {
    return this.behaviorService.getTodayBehaviors();
  }

  @Get('/ai')
  async getTodayAIBehaviors(): Promise<GetAIBehaviorResponse> {
    return this.behaviorService.getAIBehaviors();
  }

  @Patch(':id/status')
  async updateTodayBehaviorStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(PatchTodayBehaviorStatusRequestSchema))
    body: PatchTodayBehaviorStatusRequest,
  ): Promise<PatchTodayBehaviorStatusResponse> {
    return this.behaviorService.updateTodayBehaviorStatus(id, body.status);
  }
}
