import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { DodoChatRequestSchema, type DodoChatRequest, type DodoChatResponse } from '@web24/shared';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(SessionAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getDodoChat(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(DodoChatRequestSchema)) body: DodoChatRequest,
  ): Promise<DodoChatResponse> {
    return this.chatService.getDodoChat(userId, body.message);
  }
}
