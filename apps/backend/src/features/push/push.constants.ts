export const DODO_PUSH_MESSAGES = {
  LUNCH: [
    '점심 먹었으면 이제 딱 1분! 두두랑 같이 해볼까?',
    '점심 먹고 나른하지? 지금 딱 움직이면 잠 확 깰걸?',
    '두두 심심해서 현기증 난다.. 보러와줘!',
  ],
  EVENING: [
    '오늘 하루 어땠어? 네가 오기만을 기다리고 있어!',
    '오늘을 작게라도 남겨볼까?',
    '오늘 하루도 고생했어~ 도장 쾅 찍으러 와!',
  ],
} as const;

export type DodoPushType = keyof typeof DODO_PUSH_MESSAGES;
