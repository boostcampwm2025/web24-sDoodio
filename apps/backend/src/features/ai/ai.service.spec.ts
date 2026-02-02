import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';
import { LangGraphService } from './lang-graph.service';

describe('AIService', () => {
  let service: AIService;
  let langGraphService: { invokeDodoAgent: jest.Mock };

  beforeEach(async () => {
    langGraphService = { invokeDodoAgent: jest.fn() };
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
