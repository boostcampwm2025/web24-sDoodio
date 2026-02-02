import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessageLike } from '@langchain/core/messages';
import { DODO_ACTION_VALUES, DODO_ACTIONS, type DodoAction } from '@web24/shared';
import { Goal } from '../goal/goal.entity';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';
import {
  buildBehaviorRecommendationPrompt,
  buildDodoActionPrompt,
  buildDodoChatSystemPrompt,
} from './ai.prompt';

type AIBehaviorRecommendation = {
  마음열기: string;
  시작하기: string;
  이어가기: string;
  몰입하기: string;
};

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly configService: ConfigService) {}

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

  async createDodoMessage(history: DodoChatMessage[], message: string) {
    const systemPrompt = buildDodoChatSystemPrompt();

    const messages: BaseMessageLike[] = [
      {
        role: 'system' as const,
        content: [{ type: 'text', text: systemPrompt }],
      },
      ...history
        .slice()
        .reverse()
        .map((entry) => ({
          role: entry.role,
          content: [{ type: 'text' as const, text: entry.content }],
        })),
      {
        role: 'user' as const,
        content: [{ type: 'text', text: message }],
      },
    ];

    const reply = await this.callClova(messages);

    return reply;
  }

  async getDodoAction(message: string): Promise<DodoAction> {
    const systemPrompt = buildDodoActionPrompt();

    const messages: BaseMessageLike[] = [
      {
        role: 'system' as const,
        content: [{ type: 'text', text: systemPrompt }],
      },
      {
        role: 'user' as const,
        content: [{ type: 'text', text: message }],
      },
    ];

    const action = (await this.callClova(messages)) as DodoAction;

    if (DODO_ACTION_VALUES.includes(action)) return action;
    return DODO_ACTIONS.none;
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
    return String(content ?? '');
  }

  private async callClova(messages: BaseMessageLike[]): Promise<string> {
    const llm = new ChatOpenAI({
      model: 'HCX-005',
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
