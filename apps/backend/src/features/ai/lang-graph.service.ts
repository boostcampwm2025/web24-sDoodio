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

  private readonly modelConfig = {
    toolPlan: 'HCX-005',
    action: 'HCX-DASH-002',
    chat: 'HCX-005',
    failed: 'HCX-005',
  } as const;

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

    const content = await this.callClova(messages, this.modelConfig.toolPlan);
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
      const actionTools = new Set<ToolName>(['dodoSitdown', 'dodoWink', 'dodoHurray']);
      const seen = new Set<ToolName>();
      let actionToolSelected = false;
      // 허용된 tool만 유지하고, 중복 제거 + 액션 도구는 하나만 남긴다.
      const normalizedTools = tools.reduce<ToolName[]>((acc, tool) => {
        if (!(TOOL_NAMES as readonly string[]).includes(tool)) return acc;
        if (seen.has(tool)) return acc;
        if (actionTools.has(tool)) {
          if (actionToolSelected) return acc;
          actionToolSelected = true;
        }
        seen.add(tool);
        acc.push(tool);
        return acc;
      }, []);
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

    const results = await Promise.allSettled(
      tools.map((tool) => {
        if (tool === 'fetchTodayBehaviors') return this.fetchTodayBehaviors(state);
        if (tool === 'fetchGoals') return this.fetchGoals(state);
        if (tool === 'dodoSitdown') return this.setDodoSitdown();
        if (tool === 'dodoWink') return this.setDodoWink();
        if (tool === 'dodoHurray') return this.setDodoHurray();
        return Promise.reject(new Error(`Unknown tool: ${tool}`));
      }),
    );

    let { dodoAction } = state;
    // 성공한 tool 결과를 toolResults에 합치고, 유효한 dodoAction은 한 번만 담으며, 실패는 로그로 남긴다.
    const toolResults = results.reduce<Record<string, unknown>>((acc, result) => {
      if (result.status === 'fulfilled' && result.value && typeof result.value === 'object') {
        const { dodoAction: toolAction, ...rest } = result.value;
        if (
          !dodoAction &&
          typeof toolAction === 'string' &&
          DODO_ACTION_VALUES.includes(toolAction as (typeof DODO_ACTION_VALUES)[number])
        ) {
          dodoAction = toolAction as (typeof DODO_ACTION_VALUES)[number];
        }
        if (Object.keys(rest).length) {
          Object.assign(acc, rest);
        }
      } else if (result.status === 'rejected') {
        this.logger.error('Tool execution failed', result.reason);
      }
      return acc;
    }, {});

    return {
      ...(dodoAction ? { dodoAction } : {}),
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

  private async setDodoSitdown(): Promise<Record<string, unknown>> {
    return { dodoAction: DODO_ACTIONS.sitDown };
  }

  private async setDodoWink(): Promise<Record<string, unknown>> {
    return { dodoAction: DODO_ACTIONS.wink };
  }

  private async setDodoHurray(): Promise<Record<string, unknown>> {
    return { dodoAction: DODO_ACTIONS.hurray };
  }

  private readonly dodoActionLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    if (state.dodoAction) return {};
    const systemPrompt = buildDodoActionPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(state.dodoReply ?? ''),
    ];
    const action = await this.callClova(messages, this.modelConfig.action);
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

    const dodoReply = await this.callClova(messages, this.modelConfig.chat);
    return { llmCalls: 1, dodoReply };
  };

  private readonly dodoToolChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    const systemContent = buildDodoChatSystemPrompt(state);

    const messages: BaseMessage[] = [
      new SystemMessage(systemContent),
      ...state.messages,
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages, this.modelConfig.chat);
    return state.dodoAction
      ? { llmCalls: 1, dodoReply }
      : { llmCalls: 1, dodoReply, dodoAction: DODO_ACTIONS.none };
  };

  private readonly dodoFailedChatLlmCallNode: GraphNode<typeof DodoAgentStateSchema> = async (
    state,
  ) => {
    const systemPrompt = buildDodoFailedChatSystemPrompt();

    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(state.userInput),
    ];

    const dodoReply = await this.callClova(messages, this.modelConfig.failed);
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

  public async callClova(messages: BaseMessageLike[], model?: string): Promise<string> {
    const DEFAULT_MODEL = 'HCX-005';
    const llm = new ChatOpenAI({
      model: model ?? DEFAULT_MODEL,
      apiKey: this.configService.getOrThrow<string>('CLOVA_API_KEY'),
      configuration: {
        baseURL: 'https://clovastudio.stream.ntruss.com/v1/openai',
      },
    });

    try {
      this.logger.debug(`CLOVA model: ${model ?? DEFAULT_MODEL}`);
      const response = await llm.invoke(messages);
      const content = this.extractContent(response.content);
      if (!content) {
        throw new Error('Empty response content');
      }
      this.logger.debug(`CLOVA API result: ${content}`);
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
