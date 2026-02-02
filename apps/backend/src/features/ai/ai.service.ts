import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, BaseMessage, BaseMessageLike, HumanMessage } from '@langchain/core/messages';
import { Goal } from '../goal/goal.entity';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';
import { buildBehaviorRecommendationPrompt } from './ai.prompt';
import { LangGraphService } from './lang-graph.service';
import { AIBehaviorRecommendation, DodoAgentState } from './ai.type';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly langGraphService: LangGraphService,
  ) {}

  async getAIBehaviorTitles(goal: Goal): Promise<string[]> {
    const systemPrompt = buildBehaviorRecommendationPrompt(goal);

    const messages: BaseMessageLike[] = [
      { role: 'user', content: [{ type: 'text', text: systemPrompt }] },
    ];

    this.logger.log(`send Clova API with title:${goal.title} id: ${goal.id}`);
    const content = await this.callClova(messages);
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      this.logger.error(`Failed to find JSON object in Clova API response: ${content}`);
      throw new Error('Failed to parse JSON from Clova API response');
    }

    const jsonStr = content.substring(startIndex, endIndex + 1);

    try {
      const aiResultObject = JSON.parse(jsonStr) as AIBehaviorRecommendation;
      this.logger.log(`Response of Clova API:: ${jsonStr}`);
      return [aiResultObject.몰입하기];
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to parse JSON: ${error.message}`, error.stack, jsonStr);
      } else {
        this.logger.error('Failed to parse JSON: Unknown error', String(error), jsonStr);
      }
      throw new Error('AI 응답 JSON 파싱에 실패했습니다.');
    }
  }

  async invokeDodoAgent(userId: string, message: string, history: DodoChatMessage[]) {
    const messages: BaseMessage[] = history
      .slice()
      .reverse()
      .map((entry) =>
        entry.role === 'assistant' ? new AIMessage(entry.content) : new HumanMessage(entry.content),
      );

    const state: DodoAgentState = {
      userId,
      messages,
      userInput: message,
      dodoAction: undefined,
      dodoReply: undefined,
      toolPlan: undefined,
      toolPlanRaw: undefined,
      toolPlanValid: undefined,
      toolResults: undefined,
      toolValidationFailures: 0,
      final: undefined,
      llmCalls: 0,
    };

    return this.langGraphService.invokeDodoAgent(state);
  }

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
