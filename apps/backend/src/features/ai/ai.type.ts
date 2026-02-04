import { MessagesValue, ReducedValue, StateSchema } from '@langchain/langgraph';
import { DODO_ACTION_VALUES, DodoChatResponseSchema } from '@web24/shared';
import { z } from 'zod/v4';

export type AIBehaviorRecommendation = {
  마음열기: string;
  시작하기: string;
  이어가기: string;
  몰입하기: string;
};

export const TOOL_NAMES = [
  'fetchTodayBehaviors',
  'fetchGoals',
  'dodoSitdown',
  'dodoWink',
  'dodoHurray',
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

export const DodoAgentStateSchema = new StateSchema({
  userId: z.uuid({ version: 'v7' }),
  messages: MessagesValue,
  userInput: z.string(),

  dodoAction: z.enum(DODO_ACTION_VALUES).optional(),
  dodoReply: z.string().optional(),

  toolPlan: z.array(z.enum(TOOL_NAMES)).optional(),
  toolPlanRaw: z.string().optional(),
  toolPlanValid: z.boolean().optional(),
  toolResults: z.record(z.string(), z.unknown()).optional(),
  toolValidationFailures: new ReducedValue(z.number(), {
    reducer: (x, y) => x + y,
  }),

  final: DodoChatResponseSchema.optional(),

  llmCalls: new ReducedValue(z.number().default(0), { reducer: (x, y) => x + y }),
});
export type DodoAgentState = typeof DodoAgentStateSchema.State;
