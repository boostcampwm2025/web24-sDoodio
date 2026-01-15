import { Get, Body, Controller, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  type GetAIBehaviorResponse,
  type PatchAIBehaviorStatusRequest,
  PatchAIBehaviorStatusRequestSchema,
  PatchAIBehaviorStatusResponse,
  type PatchTodayBehaviorStatusRequest,
  PatchTodayBehaviorStatusRequestSchema,
  PatchTodayBehaviorStatusResponse,
  type PostAIBehaviorResponse,
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

  @Post('/ai')
  async createAIBehaviors(): Promise<PostAIBehaviorResponse> {
    return this.behaviorService.createAIBhaviors();
  }

  @Patch('/ai/:id/status')
  async updateAIBehaviorStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(PatchAIBehaviorStatusRequestSchema))
    body: PatchAIBehaviorStatusRequest,
  ): Promise<PatchAIBehaviorStatusResponse> {
    return this.behaviorService.updateAIBehaviorStatus(id, body.status);
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
