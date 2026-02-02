import {
  BaseMessage,
  BaseMessageLike,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphNode, END, START, StateGraph } from '@langchain/langgraph';
import { In, Not, type Repository } from 'typeorm';
import {
  DODO_ACTIONS,
  DODO_ACTION_VALUES,
  DodoChatResponse,
  DodoChatResponseSchema,
} from '@web24/shared';
import { getKstDayKey } from '../../common/utils/time.utils';
import {
  buildDodoActionPrompt,
  buildDodoChatSystemPrompt,
  buildDodoFailedChatSystemPrompt,
  buildToolPlanPrompt,
} from './ai.prompt';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { DodoAgentState, DodoAgentStateSchema, TOOL_NAMES, ToolName } from './ai.type';

@Injectable()
export class LangGraphService {
  private readonly logger = new Logger(LangGraphService.name);

  private readonly graph;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TodayBehavior)
    private readonly todayBehaviorRepository: Repository<TodayBehavior>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {
    this.graph = new StateGraph(DodoAgentStateSchema)
      .addNode('decideToolPlanLlmCallNode', this.decideToolPlanLlmCallNode)
      .addNode('validateToolPlanNode', this.validateToolPlanNode)
      .addNode('executeToolsNode', this.executeToolsNode)
      .addNode('dodoActionLlm', this.dodoActionLlmCallNode)
      .addNode('dodoChatLlm', this.dodoChatLlmCallNode)
      .addNode('dodoToolChatLlm', this.dodoToolChatLlmCallNode)
      .addNode('dodoFailedChatLlm', this.dodoFailedChatLlmCallNode)
      .addNode('finalize', this.finalizeNode)

      .addEdge(START, 'decideToolPlanLlmCallNode')
      .addEdge('decideToolPlanLlmCallNode', 'validateToolPlanNode')
      .addConditionalEdges('validateToolPlanNode', (state) => {
        if (!state.toolPlanValid && state.toolValidationFailures >= 2) {
          return 'dodoFailedChatLlm';
        }
        if (!state.toolPlanValid) return 'decideToolPlanLlmCallNode';
        if (!state.toolPlan?.length) return 'dodoChatLlm';
        return 'executeToolsNode';
      })
      .addEdge('executeToolsNode', 'dodoToolChatLlm')
      .addEdge('dodoChatLlm', 'dodoActionLlm')

      .addEdge('dodoActionLlm', 'finalize')
      .addEdge('dodoToolChatLlm', 'finalize')
      .addEdge('dodoFailedChatLlm', 'finalize')
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

  private readonly decideToolPlanLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    const systemPrompt = buildToolPlanPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(state.userInput),
    ];

    const content = await this.callClova(messages);
    return {
      llmCalls: 1,
      toolPlanRaw: content,
      toolPlanValid: undefined,
    };
  };

  private readonly validateToolPlanNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    if (!state.toolPlanRaw) {
      return {
        toolPlanValid: false,
        toolValidationFailures: 1,
      };
    }

    try {
      const parsed = JSON.parse(state.toolPlanRaw) as { tools?: ToolName[] };
      const tools = Array.isArray(parsed.tools) ? parsed.tools : [];
      const normalizedTools = tools.filter((tool) =>
        (TOOL_NAMES as readonly string[]).includes(tool),
      );
      const isValid = Array.isArray(parsed.tools);

      return {
        toolPlan: normalizedTools,
        toolPlanValid: isValid,
        toolValidationFailures: isValid ? 0 : 1,
      };
    } catch (error) {
      this.logger.error('Failed to parse tool plan JSON', String(error), state.toolPlanRaw);
      return {
        toolPlanValid: false,
        toolValidationFailures: 1,
      };
    }
  };

  private readonly executeToolsNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const tools = state.toolPlan ?? [];
    if (!tools.length) return {};

    const results = await Promise.all(
      tools.map((tool) => {
        if (tool === 'fetchTodayBehaviors') return this.fetchTodayBehaviors(state);
        if (tool === 'fetchGoals') return this.fetchGoals(state);
        return Promise.resolve(undefined);
      }),
    );

    const toolResults = results.reduce<Record<string, unknown>>((acc, result) => {
      if (result && typeof result === 'object') {
        Object.assign(acc, result);
      }
      return acc;
    }, {});

    return {
      toolResults: {
        ...state.toolResults,
        ...toolResults,
      },
    };
  };

  private async fetchTodayBehaviors(state: DodoAgentState): Promise<Record<string, unknown>> {
    const todayDate = getKstDayKey();
    const todayBehaviors = await this.todayBehaviorRepository.find({
      where: {
        date: todayDate,
        user: { id: state.userId },
        status: Not(In(['skipped', 'ignored', 'deleted'])),
      },
      relations: { behavior: { goal: true } },
    });

    return {
      fetchTodayBehaviors: todayBehaviors.map((tb) => ({
        id: tb.id,
        title: tb.behavior.title,
        goalTitle: tb.behavior.goal.title,
        difficulty: tb.behavior.difficulty,
        isChecked: tb.status === 'completed',
      })),
    };
  }

  private async fetchGoals(state: DodoAgentState): Promise<Record<string, unknown>> {
    const goals = await this.goalRepository.find({
      where: { user: { id: state.userId } },
    });

    return {
      fetchGoals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
      })),
    };
  }

  private readonly dodoActionLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
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

  private readonly dodoChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const systemContent = buildDodoChatSystemPrompt(state);

    const messages: BaseMessage[] = [
      new SystemMessage(systemContent),
      ...state.messages,
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages);
    return { llmCalls: 1, dodoReply };
  };

  private readonly dodoToolChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    const systemContent = buildDodoChatSystemPrompt(state);

    const messages: BaseMessage[] = [
      new SystemMessage(systemContent),
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages);
    return { llmCalls: 1, dodoReply, dodoAction: DODO_ACTIONS.none };
  };

  private readonly dodoFailedChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    const systemPrompt = buildDodoFailedChatSystemPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages);
    return { llmCalls: 1, dodoReply, dodoAction: DODO_ACTIONS.none };
  };

  private readonly finalizeNode: GraphNode<typeof DodoAgentStateSchema> = async (state) => {
    const result = DodoChatResponseSchema.safeParse({
      reply: state.dodoReply,
      action: state.dodoAction,
    });
    if (!result.success) return {};

    return { final: result.data };
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
    return `${content}`;
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
