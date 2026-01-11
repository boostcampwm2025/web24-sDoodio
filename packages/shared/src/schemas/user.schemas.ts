import { USER_NICKNAME_MAX_LENGTH } from '../constants/user.constants';
import { z } from '../zod';

export const UserSchema = z.object({
  id: z.uuid({ version: 'v7' }),
  nickname: z.string().min(1).max(USER_NICKNAME_MAX_LENGTH),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserResponseSchema = UserSchema;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
