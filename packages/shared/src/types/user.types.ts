export const USER_KINDS = {
  guest: 'guest',
  user: 'user',
  google: 'google',
} as const;

export type UserKind = (typeof USER_KINDS)[keyof typeof USER_KINDS];
