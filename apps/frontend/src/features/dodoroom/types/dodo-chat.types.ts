export type ChatRole = 'user' | 'dodo';

export type Message = {
  id: string;
  role: ChatRole;
  text: string;
};
