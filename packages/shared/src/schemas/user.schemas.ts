import { USER_NICKNAME_MAX_LENGTH } from '../constants/user.constants';
import { USER_KINDS } from '../types/user.types';
import { z } from '../zod';

export const UserSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  nickname: z.string().min(1).max(USER_NICKNAME_MAX_LENGTH),
  kind: z.enum([USER_KINDS.guest, USER_KINDS.user, USER_KINDS.google]),
  provider: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = UserSchema.extend({
  isNewUser: z.boolean().optional(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UserMeResponseSchema = UserSchema;
export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
