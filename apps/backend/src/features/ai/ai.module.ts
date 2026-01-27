import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { DodoChatMessage } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DodoChatMessage, User])],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
