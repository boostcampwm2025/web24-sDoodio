import { Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import webpush from 'web-push';
import { Cron } from '@nestjs/schedule';
import pLimit from 'p-limit';
import type {
  PushSubscription,
  SendPushNotificationRequest,
  SendPushNotificationResponse,
} from '@web24/shared';
import { User } from '../user/user.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { DodoChatMessage, DODO_CHAT_ROLE } from '../chat/dodo-chat-message.entity';
import { DODO_PUSH_MESSAGES, type DodoPushType } from './push.constants';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);

  private readonly vapidPublicKey: string;

  private readonly vapidPrivateKey: string;

  private readonly vapidSubject: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: Repository<PushSubscriptionEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DodoChatMessage)
    private readonly dodoChatRepository: Repository<DodoChatMessage>,
  ) {
    this.vapidPublicKey = this.configService.getOrThrow<string>('VAPID_PUBLIC_KEY');
    this.vapidPrivateKey = this.configService.getOrThrow<string>('VAPID_PRIVATE_KEY');
    this.vapidSubject = this.configService.getOrThrow<string>('VAPID_SUBJECT');
  }

  onModuleInit() {
    webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
  }

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  async upsertSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.pushSubscriptionRepository.upsert(
      {
        user,
        endpoint: subscription.endpoint,
        subscription,
        updatedAt: new Date(),
      },
      ['endpoint'],
    );
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    const existing = await this.pushSubscriptionRepository.findOne({
      where: {
        endpoint,
        user: { id: userId },
      },
    });

    if (!existing) {
      return;
    }

    await this.pushSubscriptionRepository.remove(existing);
  }

  async sendToUser(
    userId: string,
    payload: SendPushNotificationRequest,
  ): Promise<SendPushNotificationResponse> {
    const subscriptions = await this.pushSubscriptionRepository.find({
      where: { user: { id: userId } },
    });

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0, removed: 0 };
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body ?? '',
      url: payload.url ?? '/',
    });

    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription.subscription, payloadString);
          return { sent: 1, failed: 0, removed: 0 };
        } catch (error) {
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const { statusCode } = error as { statusCode: number };
            if (statusCode === 404 || statusCode === 410) {
              await this.pushSubscriptionRepository.remove(subscription);
              return { sent: 0, failed: 1, removed: 1 };
            }
          }
          return { sent: 0, failed: 1, removed: 0 };
        }
      }),
    );

    return results.reduce(
      (acc, item) => ({
        sent: acc.sent + item.sent,
        failed: acc.failed + item.failed,
        removed: acc.removed + item.removed,
      }),
      { sent: 0, failed: 0, removed: 0 },
    );
  }

  @Cron('0 0 13 * * *', { name: 'dodo_lunch_push', timeZone: 'Asia/Seoul' })
  async handleLunchPush() {
    await this.sendDodoPush('LUNCH');
  }

  @Cron('0 0 19 * * *', { name: 'dodo_evening_push', timeZone: 'Asia/Seoul' })
  async handleEveningPush() {
    await this.sendDodoPush('EVENING');
  }

  private async sendDodoPush(type: DodoPushType) {
    const messages = DODO_PUSH_MESSAGES[type];
    const content = messages[Math.floor(Math.random() * messages.length)];

    const subscriptions = await this.pushSubscriptionRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.user', 'user')
      .distinctOn(['sub.userId'])
      .getMany();

    this.logger.log(`Starting Dodo push [${type}]: sending to ${subscriptions.length} users`);

    const limit = pLimit(10);
    await Promise.all(
      subscriptions.map((sub) =>
        limit(async () => {
          try {
            // 1. 채팅 내역 저장
            await this.dodoChatRepository.save(
              this.dodoChatRepository.create({
                user: sub.user,
                role: DODO_CHAT_ROLE.ASSISTANT,
                content,
              }),
            );

            // 2. 푸시 발송
            await this.sendToUser(sub.user.id, {
              title: '두두의 메세지',
              body: content,
              url: '/dodo-room',
            });
          } catch (error) {
            this.logger.error(`Failed to send push message to user ${sub.user.id}:`, error);
          }
        }),
      ),
    );
  }
}
