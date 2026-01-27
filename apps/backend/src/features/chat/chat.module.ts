import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DodoChatMessage } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';
import { AIService } from '../ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([DodoChatMessage, User])],
  controllers: [ChatController],
  providers: [ChatService, AIService],
  exports: [ChatService],
})
export class ChatModule {}
