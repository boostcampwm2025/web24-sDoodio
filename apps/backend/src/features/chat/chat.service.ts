import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { DodoChatMessage, DODO_CHAT_ROLE } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  private static readonly CHAT_HISTORY_LIMIT = 12;

  constructor(
    private readonly aiService: AIService,
    @InjectRepository(DodoChatMessage)
    private readonly dodoChatRepository: Repository<DodoChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDodoChat(userId: string, message: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const history = await this.dodoChatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: ChatService.CHAT_HISTORY_LIMIT,
    });

    const reply = await this.aiService.createDodoMessage(history, message);

    await this.dodoChatRepository.save([
      this.dodoChatRepository.create({
        user,
        role: DODO_CHAT_ROLE.USER,
        content: message,
      }),
      this.dodoChatRepository.create({
        user,
        role: DODO_CHAT_ROLE.ASSISTANT,
        content: reply,
      }),
    ]);

    return { reply };
  }
}
