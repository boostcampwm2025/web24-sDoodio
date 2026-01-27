import { Test, TestingModule } from '@nestjs/testing';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  const service = {
    getDodoChat: jest.fn(),
  };

  beforeEach(async () => {
    service.getDodoChat.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('getDodoChat은 서비스 결과를 반환한다', async () => {
    service.getDodoChat.mockResolvedValue({ reply: '반가워요!' });

    const result = await controller.getDodoChat('user-1', { message: '안녕' });

    expect(service.getDodoChat).toHaveBeenCalledWith('user-1', '안녕');
    expect(result).toEqual({ reply: '반가워요!' });
  });
});
