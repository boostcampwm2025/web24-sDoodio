import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { User } from '../user/user.entity';
import { DodoChatMessage } from '../ai/dodo-chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscriptionEntity, User, DodoChatMessage])],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
