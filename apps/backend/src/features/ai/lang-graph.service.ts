import {
  BaseMessage,
  BaseMessageLike,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StateSchema,
  MessagesValue,
  ReducedValue,
  GraphNode,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { z } from 'zod/v4';
import {
  DODO_ACTIONS,
  DODO_ACTION_VALUES,
  DodoChatResponse,
  DodoChatResponseSchema,
} from '@web24/shared';
import { buildDodoActionPrompt, buildDodoChatSystemPrompt } from './ai.prompt';

const DodoAgentStateSchema = new StateSchema({
  messages: MessagesValue,
  userInput: z.string(),

  dodoAction: z.enum(DODO_ACTION_VALUES).optional(),
  dodoReply: z.string().optional(),

  final: DodoChatResponseSchema.optional(),

  llmCalls: new ReducedValue(z.number().default(0), { reducer: (x, y) => x + y }),
});
export type DodoAgentState = typeof DodoAgentStateSchema.State;

@Injectable()
export class LangGraphService {
  private readonly logger = new Logger(LangGraphService.name);

  private readonly graph;

  constructor(private readonly configService: ConfigService) {
    this.graph = new StateGraph(DodoAgentStateSchema)
      .addNode('dodoActionLlm', this.doDoActionLlmCallNode)
      .addNode('dodoChatLlm', this.doDoChatLlmCallNode)
      .addNode('finalize', this.finalizeNode)

      .addEdge(START, 'dodoChatLlm')
      .addEdge('dodoChatLlm', 'dodoActionLlm')
      .addEdge('dodoActionLlm', 'finalize')
      .addEdge('finalize', END)

      .compile()
      .withRetry({ stopAfterAttempt: 3 });
  }

  public async invokeDodoAgent(state: DodoAgentState): Promise<DodoChatResponse> {
    const result = await this.graph.invoke(state);
    if (!result?.final) {
      return {
        reply: '지금은 안 돼. 다음에 다시 말걸어줘.',
        action: DODO_ACTIONS.none,
      };
    }
    return result.final;
  }

  private doDoActionLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const systemPrompt = buildDodoActionPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(state.dodoReply ?? ''),
    ];
    const action = await this.callClova(messages);
    const dodoAction = DODO_ACTION_VALUES.includes(action as (typeof DODO_ACTION_VALUES)[number])
      ? (action as (typeof DODO_ACTION_VALUES)[number])
      : DODO_ACTIONS.none;

    return { llmCalls: 1, dodoAction };
  };

  private doDoChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const systemPrompt = buildDodoChatSystemPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...state.messages,
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages);
    return { llmCalls: 1, dodoReply };
  };

  private finalizeNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const final = DodoChatResponseSchema.parse({
      reply: state.dodoReply,
      action: state.dodoAction,
    });
    return { final };
  };

  private extractContent(content: unknown): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && 'text' in part) {
            const textValue = (part as { text?: unknown }).text;
            return typeof textValue === 'string' ? textValue : '';
          }
          return '';
        })
        .join('');
    }
    return String(content ?? '');
  }

  private async callClova(messages: BaseMessageLike[], model?: string): Promise<string> {
    const DEFAULT_MODEL = 'HCX-005';
    const llm = new ChatOpenAI({
      model: model ?? DEFAULT_MODEL,
      apiKey: this.configService.getOrThrow<string>('CLOVA_API_KEY'),
      configuration: {
        baseURL: 'https://clovastudio.stream.ntruss.com/v1/openai',
      },
    });

    try {
      const response = await llm.invoke(messages);
      const content = this.extractContent(response.content);
      if (!content) {
        throw new Error('Empty response content');
      }
      return content;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`CLOVA API error: ${error.message}`, error.stack);
      } else {
        this.logger.error('CLOVA API error: Unknown error', String(error));
      }
      throw new ServiceUnavailableException('Failed to fetch CLOVA response');
    }
  }
}
