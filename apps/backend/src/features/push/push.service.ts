import { Injectable, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import webpush from 'web-push';
import type {
  PushSubscription,
  SendPushNotificationRequest,
  SendPushNotificationResponse,
} from '@web24/shared';
import { User } from '../user/user.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly vapidPublicKey: string;

  private readonly vapidPrivateKey: string;

  private readonly vapidSubject: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: Repository<PushSubscriptionEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.pushSubscriptionRepository.findOne({
      where: { endpoint: subscription.endpoint },
      relations: ['user'],
    });

    if (existing) {
      existing.user = user;
      existing.endpoint = subscription.endpoint;
      existing.subscription = subscription;
      await this.pushSubscriptionRepository.save(existing);
      return;
    }

    const entity = this.pushSubscriptionRepository.create({
      user,
      endpoint: subscription.endpoint,
      subscription,
    });
    await this.pushSubscriptionRepository.save(entity);
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    const existing = await this.pushSubscriptionRepository.findOne({
      where: {
        endpoint,
        user: { id: userId },
      },
      relations: ['user'],
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
      relations: ['user'],
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
          const { statusCode } = error as { statusCode?: number };
          if (statusCode === 404 || statusCode === 410) {
            await this.pushSubscriptionRepository.remove(subscription);
            return { sent: 0, failed: 1, removed: 1 };
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
}
