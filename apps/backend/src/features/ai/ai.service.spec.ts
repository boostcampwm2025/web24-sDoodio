import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';
import { LangGraphService } from './lang-graph.service';

describe('AIService', () => {
  let service: AIService;
  let langGraphService: { invokeDodoAgent: jest.Mock; callClova: jest.Mock };

  beforeEach(async () => {
    langGraphService = { invokeDodoAgent: jest.fn(), callClova: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn() },
        },
        {
          provide: LangGraphService,
          useValue: langGraphService,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  describe('getAIBehaviorTitles', () => {
    it('이전 추천 행동을 프롬프트에 포함해 요청한다', async () => {
      const goal = { id: 'goal-1', title: '건강', behaviors: [] } as any;
      langGraphService.callClova.mockResolvedValue(
        JSON.stringify({
          마음열기: '산책',
          시작하기: '물 마시기',
          이어가기: '스트레칭',
          몰입하기: '달리기',
        }),
      );

      const result = await service.getAIBehaviorTitles(goal, ['이전 행동1']);

      expect(result).toEqual(['달리기']);
      const [messages] = langGraphService.callClova.mock.calls[0];
      const prompt = messages[0].content[0].text as string;
      expect(prompt).toContain('이전에 추천한 AI 행동 목록');
      expect(prompt).toContain('이전 행동1');
    });
  });

  describe('invokeDodoAgent', () => {
    it('LangGraphService에 상태를 전달하고 결과를 반환한다', async () => {
      const history = [
        { role: 'user' as const, content: '안녕' },
        { role: 'assistant' as const, content: '반가워' },
      ] as DodoChatMessage[];
      const message = '오늘 날씨 어때?';
      const mockResult = { reply: '맑아요!', action: 'none' as const };

      langGraphService.invokeDodoAgent.mockResolvedValue(mockResult);

      const result = await service.invokeDodoAgent('user-1', message, history);

      expect(result).toBe(mockResult);
      expect(langGraphService.invokeDodoAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userInput: message,
          messages: expect.any(Array),
          llmCalls: 0,
        }),
      );
    });
  });
});
