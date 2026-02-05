import {
  Delete,
  Get,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  type DeleteTodayBehaviorResponse,
  type GetAIBehaviorResponse,
  type GetTodayBehaviorsResponse,
  type PatchAIBehaviorStatusRequest,
  PatchAIBehaviorStatusRequestSchema,
  PatchAIBehaviorStatusResponse,
  type PostTodayBehaviorRequest,
  PostTodayBehaviorRequestSchema,
  type PostTodayBehaviorResponse,
  type PatchTodayBehaviorStatusRequest,
  PatchTodayBehaviorStatusRequestSchema,
  PatchTodayBehaviorStatusResponse,
  type PostAIBehaviorResponse,
} from '@web24/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { BehaviorService } from './behavior.service';

@Controller('today-behaviors')
@UseGuards(SessionAuthGuard)
export class TodayBehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Get()
  async getTodayBehaviors(@UserId() userId: string) {
    return this.behaviorService.getTodayBehaviors(userId);
  }

  @Post('/refresh')
  async refreshTodayBehaviors(@UserId() userId: string): Promise<GetTodayBehaviorsResponse> {
    return this.behaviorService.refreshTodayBehaviors(userId);
  }

  @Post()
  async createTodayBehavior(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(PostTodayBehaviorRequestSchema))
    body: PostTodayBehaviorRequest,
  ): Promise<PostTodayBehaviorResponse> {
    return this.behaviorService.createTodayBehavior(userId, body.behaviorId);
  }

  @Get('/ai')
  async getTodayAIBehaviors(@UserId() userId: string): Promise<GetAIBehaviorResponse> {
    return this.behaviorService.getAIBehaviors(userId);
  }

  @Post('/ai')
  async createAIBehaviors(@UserId() userId: string): Promise<PostAIBehaviorResponse> {
    return this.behaviorService.createAIBehaviors(userId);
  }

  @Patch('/ai/:id/status')
  async updateAIBehaviorStatus(
    @UserId() userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(PatchAIBehaviorStatusRequestSchema))
    body: PatchAIBehaviorStatusRequest,
  ): Promise<PatchAIBehaviorStatusResponse> {
    return this.behaviorService.updateAIBehaviorStatus(userId, id, body.status);
  }

  @Patch(':id/status')
  async updateTodayBehaviorStatus(
    @UserId() userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(PatchTodayBehaviorStatusRequestSchema))
    body: PatchTodayBehaviorStatusRequest,
  ): Promise<PatchTodayBehaviorStatusResponse> {
    return this.behaviorService.updateTodayBehaviorStatus(userId, id, body.status);
  }

  @Delete(':id')
  async deleteTodayBehavior(
    @UserId() userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeleteTodayBehaviorResponse> {
    return this.behaviorService.deleteTodayBehavior(userId, id);
  }
}
