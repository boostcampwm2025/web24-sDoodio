import { Injectable, Logger } from '@nestjs/common';
import { AIMessage, BaseMessage, BaseMessageLike, HumanMessage } from '@langchain/core/messages';
import { Goal } from '../goal/goal.entity';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';
import { buildBehaviorRecommendationPrompt } from './ai.prompt';
import { LangGraphService } from './lang-graph.service';
import { AIBehaviorRecommendation, DodoAgentState } from './ai.type';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly langGraphService: LangGraphService) {}

  async getAIBehaviorTitles(goal: Goal): Promise<string[]> {
    const systemPrompt = buildBehaviorRecommendationPrompt(goal);

    const messages: BaseMessageLike[] = [
      { role: 'user', content: [{ type: 'text', text: systemPrompt }] },
    ];

    this.logger.log(`send Clova API with title:${goal.title} id: ${goal.id}`);
    const content = await this.langGraphService.callClova(messages);
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

  // callClova/extractContent moved to LangGraphService for shared use.
}
