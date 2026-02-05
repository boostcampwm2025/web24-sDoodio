import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { DODO_ACTIONS } from '@web24/shared';
import { DodoChatMessage, DODO_CHAT_ROLE } from './dodo-chat-message.entity';
import { User } from '../user/user.entity';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  private static readonly CHAT_HISTORY_LIMIT = 12;

  private static readonly LIMIT_WINDOW_HOURS = 3;

  private static readonly MS_PER_HOUR = 60 * 60 * 1000;

  private static readonly GUEST_CHAT_LIMIT = 10;

  private static readonly USER_CHAT_LIMIT = 30;

  private static readonly CHAT_LIMIT_MESSAGE =
    '최근 3시간 채팅 제한에 도달했어. 잠시 후 다시 이야기하자!';

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

    const isLimited = await this.enforceChatLimit(user);
    if (isLimited) {
      return {
        reply: ChatService.CHAT_LIMIT_MESSAGE,
        action: DODO_ACTIONS.none,
        limited: true,
      };
    }

    const history = await this.dodoChatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: ChatService.CHAT_HISTORY_LIMIT,
    });

    const { reply, action } = await this.aiService.invokeDodoAgent(userId, message, history);

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

    return { reply, action, limited: false };
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

  private async enforceChatLimit(user: User) {
    const limit =
      user.kind === 'guest' ? ChatService.GUEST_CHAT_LIMIT : ChatService.USER_CHAT_LIMIT;
    const since = new Date(Date.now() - ChatService.LIMIT_WINDOW_HOURS * ChatService.MS_PER_HOUR);

    const recentCount = await this.dodoChatRepository.count({
      where: {
        user: { id: user.id },
        role: DODO_CHAT_ROLE.USER,
        createdAt: MoreThanOrEqual(since),
      },
    });

    return recentCount >= limit;
  }
}
