import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SlackService } from './slack.service';

describe('SlackService', () => {
  const createService = async (webhookUrl?: string) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(webhookUrl),
          },
        },
      ],
    }).compile();

    return module.get<SlackService>(SlackService);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('send', () => {
    it('webhook URL이 없으면 요청하지 않는다', async () => {
      const service = await createService();
      const debugSpy = jest.spyOn((service as any).logger, 'debug').mockImplementation();
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockImplementation(jest.fn() as unknown as typeof fetch);

      await service.send('hello');

      expect(debugSpy).toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('요청이 성공하면 경고를 남기지 않는다', async () => {
      const service = await createService('https://example.com/webhook');
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation();
      const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response);

      await service.send('hello');

      expect(fetchSpy).toHaveBeenCalledWith('https://example.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello' }),
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('요청이 실패하면 경고 로그를 남긴다', async () => {
      const service = await createService('https://example.com/webhook');
      const warnSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation();
      jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('fail'),
      } as unknown as Response);

      await service.send('hello');

      expect(warnSpy).toHaveBeenCalledWith('Slack webhook failed: 500 fail');
    });

    it('요청 중 오류가 나면 에러 로그를 남긴다', async () => {
      const service = await createService('https://example.com/webhook');
      const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
      jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));

      await service.send('hello');

      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
