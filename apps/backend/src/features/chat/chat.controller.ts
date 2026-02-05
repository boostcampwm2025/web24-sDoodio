import { Body, Controller, Post, Get, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  type DodoChatHistoryResponse,
  DodoChatHistoryRequestSchema,
  DodoChatRequestSchema,
  type DodoChatRequest,
  type DodoChatResponse,
  type DodoChatHistoryRequest,
} from '@web24/shared';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(SessionAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getDodoChat(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(DodoChatRequestSchema)) body: DodoChatRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DodoChatResponse> {
    const result = await this.chatService.getDodoChat(userId, body.message);
    if (result.limited) {
      res.status(429);
    }
    return { reply: result.reply, action: result.action };
  }

  @Get('history')
  async getDodoChatHistory(
    @UserId() userId: string,
    @Query(new ZodValidationPipe(DodoChatHistoryRequestSchema)) query: DodoChatHistoryRequest,
  ): Promise<DodoChatHistoryResponse> {
    return this.chatService.getDodoChatHistory(userId, query.cursor, query.limit);
  }
}
