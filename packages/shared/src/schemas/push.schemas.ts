import { z } from '../zod';

export const PushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const PushSubscriptionSchema = z.object({
  endpoint: z.string().min(1),
  expirationTime: z.number().nullable().optional(),
  keys: PushSubscriptionKeysSchema,
});
export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;

export const GetVapidPublicKeyResponseSchema = z.object({
  publicKey: z.string().min(1),
});
export type GetVapidPublicKeyResponse = z.infer<typeof GetVapidPublicKeyResponseSchema>;

export const RegisterPushSubscriptionRequestSchema = PushSubscriptionSchema;
export type RegisterPushSubscriptionRequest = PushSubscription;

export const RegisterPushSubscriptionResponseSchema = z.object({
  success: z.boolean(),
});
export type RegisterPushSubscriptionResponse = z.infer<
  typeof RegisterPushSubscriptionResponseSchema
>;

export const DeletePushSubscriptionRequestSchema = z.object({
  endpoint: z.string().min(1),
});
export type DeletePushSubscriptionRequest = z.infer<typeof DeletePushSubscriptionRequestSchema>;

export const DeletePushSubscriptionResponseSchema = z.object({
  success: z.boolean(),
});
export type DeletePushSubscriptionResponse = z.infer<typeof DeletePushSubscriptionResponseSchema>;

export const SendPushNotificationRequestSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  url: z.string().optional(),
});
export type SendPushNotificationRequest = z.infer<typeof SendPushNotificationRequestSchema>;

export const SendPushNotificationResponseSchema = z.object({
  sent: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  removed: z.number().int().nonnegative(),
});
export type SendPushNotificationResponse = z.infer<typeof SendPushNotificationResponseSchema>;
