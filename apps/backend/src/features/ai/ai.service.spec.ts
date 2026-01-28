import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';

describe('AIService', () => {
  let service: AIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  describe('createDodoMessage', () => {
    it('Clova API를 호출하고 응답을 반환한다', async () => {
      const history = [
        { role: 'user' as const, content: '안녕' },
        { role: 'assistant' as const, content: '반가워' },
      ] as DodoChatMessage[];
      const message = '오늘 날씨 어때?';
      const mockReply = '맑아요!';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          result: {
            message: {
              content: mockReply,
            },
          },
        }),
      });

      const result = await service.createDodoMessage(history, message);

      expect(result).toBe(mockReply);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('clovastudio.stream.ntruss.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.any(String),
          }),
          body: expect.stringContaining(message),
        }),
      );
    });

    it('Clova API 호출 실패 시 에러를 던진다', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.createDodoMessage([], 'hello')).rejects.toThrow();
    });
  });
});
