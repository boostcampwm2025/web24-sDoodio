import { USER_NICKNAME_MAX_LENGTH } from '../constants/user.constants';
import { USER_KINDS } from '../types/user.types';
import { z } from '../zod';

export const UserSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  nickname: z.string().min(1).max(USER_NICKNAME_MAX_LENGTH),
  kind: z.enum([USER_KINDS.guest, USER_KINDS.user]),
});

export type User = z.infer<typeof UserSchema>;

export const UserMeResponseSchema = UserSchema;
export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;
