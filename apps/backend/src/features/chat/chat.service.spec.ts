import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { DodoChatMessage, DODO_CHAT_ROLE } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';
import { AIService } from '../ai/ai.service';

describe('ChatService', () => {
  let service: ChatService;
  const dodoChatRepository = {
    find: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn((value) => value),
  };
  const userRepository = {
    findOne: jest.fn(),
  };
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('test-key'),
  };
  const aiService = { createDodoMessage: jest.fn() };

  beforeEach(async () => {
    aiService.createDodoMessage.mockReset();
    dodoChatRepository.find.mockReset();
    dodoChatRepository.save.mockReset();
    dodoChatRepository.create.mockReset();
    userRepository.findOne.mockReset();
    configService.getOrThrow.mockClear();

    dodoChatRepository.create.mockImplementation((value) => value);
    dodoChatRepository.save.mockImplementation((value) => value);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: AIService, useValue: aiService },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: getRepositoryToken(DodoChatMessage),
          useValue: dodoChatRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getDodoChat은 유저가 없으면 에러를 던진다', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.getDodoChat('user-1', '안녕')).rejects.toThrow('User not found');
  });

  it('getDodoChat은 응답을 저장하고 reply를 반환한다', async () => {
    userRepository.findOne.mockResolvedValue({ id: 'user-1' });

    dodoChatRepository.find.mockResolvedValue([
      { role: DODO_CHAT_ROLE.USER, content: '이전 질문' },
      { role: DODO_CHAT_ROLE.ASSISTANT, content: '이전 답변' },
    ]);

    aiService.createDodoMessage.mockResolvedValue('반가워요!');

    const result = await service.getDodoChat('user-1', '안녕');

    expect(aiService.createDodoMessage).toHaveBeenCalledWith(
      [
        { role: DODO_CHAT_ROLE.USER, content: '이전 질문' },
        { role: DODO_CHAT_ROLE.ASSISTANT, content: '이전 답변' },
      ],
      '안녕',
    );

    expect(dodoChatRepository.save).toHaveBeenCalledTimes(1);
    expect(dodoChatRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({
        role: DODO_CHAT_ROLE.USER,
        content: '안녕',
      }),
      expect.objectContaining({
        role: DODO_CHAT_ROLE.ASSISTANT,
        content: '반가워요!',
      }),
    ]);

    expect(result).toEqual({ reply: '반가워요!' });
  });
});
