import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DODO_ACTIONS } from '@web24/shared';
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

      const callClovaSpy = jest.spyOn(service as any, 'callClova').mockResolvedValue(mockReply);

      const result = await service.createDodoMessage(history, message);

      expect(result).toBe(mockReply);
      expect(callClovaSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: [expect.objectContaining({ text: message })],
          }),
        ]),
      );
    });

    it('Clova API 호출 실패 시 에러를 던진다', async () => {
      jest.spyOn(service as any, 'callClova').mockRejectedValue(new Error('fail'));

      await expect(service.createDodoMessage([], 'hello')).rejects.toThrow();
    });
  });

  describe('getDodoAction', () => {
    it('Clova API를 호출하고 유효한 행동을 반환한다', async () => {
      const message = '사랑해';

      const callClovaSpy = jest
        .spyOn(service as any, 'callClova')
        .mockResolvedValue(DODO_ACTIONS.wink);

      const result = await service.getDodoAction(message);

      expect(result).toBe(DODO_ACTIONS.wink);
      expect(callClovaSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: [expect.objectContaining({ text: message })],
          }),
        ]),
      );
    });

    it('Clova API 응답이 유효하지 않으면 none을 반환한다', async () => {
      jest.spyOn(service as any, 'callClova').mockResolvedValue('INVALID_ACTION');

      const result = await service.getDodoAction('아무 말');

      expect(result).toBe(DODO_ACTIONS.none);
    });

    it('Clova API 호출 실패 시 에러를 던진다', async () => {
      jest.spyOn(service as any, 'callClova').mockRejectedValue(new Error('fail'));

      await expect(service.getDodoAction('hello')).rejects.toThrow();
    });
  });
});
