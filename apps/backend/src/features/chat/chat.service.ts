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

    const [reply, action] = await Promise.all([
      this.aiService.createDodoMessage(history, message),
      this.aiService.getDodoAction(message),
    ]);

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

    return { reply, action };
  }

  async getDodoChatHistory(userId: string, cursor?: string, limit: number = 10) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.dodoChatRepository
      .createQueryBuilder('message')
      .where('message.userId = :userId', { userId })
      .orderBy('message.id', 'DESC')
      .take(limit + 1); // 더 있는지 확인하는 용도

    if (cursor) {
      queryBuilder.andWhere('message.id < :cursor', { cursor });
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const lastMessageId = resultMessages.at(-1)?.id ?? null;

    return {
      messages: resultMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      })),
      hasMore,
      nextCursor: hasMore ? lastMessageId : null,
    };
  }
}
