import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import {
  DeletePushSubscriptionRequestSchema,
  RegisterPushSubscriptionRequestSchema,
  SendPushNotificationRequestSchema,
  type DeletePushSubscriptionRequest,
  type DeletePushSubscriptionResponse,
  type GetVapidPublicKeyResponse,
  type RegisterPushSubscriptionRequest,
  type RegisterPushSubscriptionResponse,
  type SendPushNotificationRequest,
  type SendPushNotificationResponse,
} from '@web24/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-public-key')
  getVapidPublicKey(): GetVapidPublicKeyResponse {
    return {
      publicKey: this.pushService.getVapidPublicKey(),
    };
  }

  @Post('subscriptions')
  @UseGuards(SessionAuthGuard)
  async registerSubscription(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(RegisterPushSubscriptionRequestSchema))
    body: RegisterPushSubscriptionRequest,
  ): Promise<RegisterPushSubscriptionResponse> {
    await this.pushService.upsertSubscription(userId, body);
    return { success: true };
  }

  @Delete('subscriptions')
  @UseGuards(SessionAuthGuard)
  async deleteSubscription(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(DeletePushSubscriptionRequestSchema))
    body: DeletePushSubscriptionRequest,
  ): Promise<DeletePushSubscriptionResponse> {
    await this.pushService.removeSubscription(userId, body.endpoint);
    return { success: true };
  }

  @Post('notifications/test')
  @UseGuards(SessionAuthGuard)
  async sendTestNotification(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(SendPushNotificationRequestSchema))
    body: SendPushNotificationRequest,
  ): Promise<SendPushNotificationResponse> {
    const result = await this.pushService.sendToUser(userId, body);
    return result;
  }

  @Post('notifications/test/all')
  async sendTestNotificationToALl(
    @Body(new ZodValidationPipe(SendPushNotificationRequestSchema))
    body: SendPushNotificationRequest,
  ): Promise<SendPushNotificationResponse> {
    const result = await this.pushService.sendToAllUsers(body);
    return result;
  }
}
