import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { USER_KINDS, type UserKind } from '@web24/shared';
import { User } from '../user/user.entity';

export type SocialProfile = {
  provider: UserKind;
  id: string;
  email?: string;
  nickname?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async createGuestUser(): Promise<User> {
    const user = this.userRepository.create({
      nickname: this.generateGuestNickname(),
      kind: USER_KINDS.guest,
    });
    return this.userRepository.save(user);
  }

  async findOrCreateSocialUser(profile: SocialProfile): Promise<{ user: User; isNew: boolean }> {
    let user = await this.userRepository.findOne({
      where: { provider: profile.provider, providerId: profile.id },
    });

    let isNew = false;
    if (!user) {
      isNew = true;
      user = this.userRepository.create({
        provider: profile.provider,
        providerId: profile.id,
        email: profile.email,
        nickname: profile.nickname || this.generateGuestNickname(),
        kind: profile.provider,
      });
      user = await this.userRepository.save(user);
    }

    return { user, isNew };
  }

  async linkGuestToSocial(
    userId: string,
    profile: SocialProfile,
  ): Promise<{ user: User; isNew: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.kind !== USER_KINDS.guest) {
      return this.findOrCreateSocialUser(profile);
    }

    const existingUser = await this.userRepository.findOne({
      where: { provider: profile.provider, providerId: profile.id },
    });

    if (existingUser) {
      // 이미 연동된 계정이 있다면 해당 계정으로 로그인
      return { user: existingUser, isNew: false };
    }

    user.provider = profile.provider;
    user.providerId = profile.id;
    user.email = profile.email;
    user.kind = profile.provider;

    await this.userRepository.save(user);

    return { user, isNew: false };
  }

  private generateGuestNickname(): string {
    const random = Math.random().toString(36).slice(2, 8);
    return `G-${random}`;
  }
}
