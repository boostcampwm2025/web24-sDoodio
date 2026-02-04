import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DodoChatMessage } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([DodoChatMessage, User]), AIModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
