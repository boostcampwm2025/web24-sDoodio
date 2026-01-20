import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

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
      kind: 'guest',
    });
    return this.userRepository.save(user);
  }

  private generateGuestNickname(): string {
    const random = Math.random().toString(36).slice(2, 8);
    return `G-${random}`;
  }
}
