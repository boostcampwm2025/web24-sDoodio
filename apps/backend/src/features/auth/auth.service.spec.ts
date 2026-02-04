import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('서비스가 정의된다', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('아이디로 유저를 조회한다', async () => {
      const user = { id: 'user-id' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getUserById('user-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(result).toBe(user);
    });
  });

  describe('createGuestUser', () => {
    it('게스트 유저를 생성해서 저장한다', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);

      userRepository.create.mockImplementation((data) => data as User);
      userRepository.save.mockResolvedValue({
        id: 'user-id',
        nickname: 'G-4fzyo8',
        kind: 'guest',
      } as User);

      const result = await service.createGuestUser();

      expect(userRepository.create).toHaveBeenCalledWith({
        nickname: 'G-4fzyo8',
        kind: 'guest',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        nickname: 'G-4fzyo8',
        kind: 'guest',
      });
      expect(result.kind).toBe('guest');
    });
  });

  describe('findOrCreateSocialUser', () => {
    const profile = {
      provider: 'google' as const,
      id: 'social-id',
      email: 'test@example.com',
      nickname: 'Test User',
    };

    it('이미 존재하는 소셜 유저라면 해당 유저를 반환한다', async () => {
      const existingUser = { id: 'user-id', provider: 'google', providerId: 'social-id' } as User;
      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.findOrCreateSocialUser(profile);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { provider: profile.provider, providerId: profile.id },
      });
      expect(result).toEqual({ user: existingUser, isNew: false });
    });

    it('존재하지 않는다면 새로 생성해서 반환한다', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((data) => ({ ...data, id: 'new-user-id' }) as User);
      userRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.findOrCreateSocialUser(profile);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: profile.provider,
          providerId: profile.id,
          email: profile.email,
          nickname: profile.nickname,
        }),
      );
      expect(result.isNew).toBe(true);
      expect(result.user.id).toBe('new-user-id');
    });
  });

  describe('linkGuestToSocial', () => {
    const userId = 'guest-id';
    const profile = {
      provider: 'google' as const,
      id: 'social-id',
      email: 'test@example.com',
    };

    it('게스트 유저가 아니거나 없으면 소셜 로그인 로직을 따른다', async () => {
      userRepository.findOne.mockResolvedValue(null); // or user.kind !== guest

      const spy = jest
        .spyOn(service, 'findOrCreateSocialUser')
        .mockResolvedValue({ user: {} as User, isNew: true });

      await service.linkGuestToSocial(userId, profile);

      expect(spy).toHaveBeenCalledWith(profile);
    });

    it('이미 연동된 소셜 계정이 있으면 해당 계정으로 로그인 처리한다', async () => {
      const guestUser = { id: userId, kind: 'guest' } as User;
      const existingSocialUser = { id: 'social-user-id' } as User;

      userRepository.findOne
        .mockResolvedValueOnce(guestUser) // getUserById
        .mockResolvedValueOnce(existingSocialUser); // find existing social user

      const result = await service.linkGuestToSocial(userId, profile);

      expect(result).toEqual({ user: existingSocialUser, isNew: false });
    });

    it('연동된 계정이 없으면 게스트 계정을 소셜 계정으로 업데이트한다', async () => {
      const guestUser = { id: userId, kind: 'guest' } as User;

      userRepository.findOne.mockResolvedValueOnce(guestUser).mockResolvedValueOnce(null);

      userRepository.save.mockImplementation(async (u) => u as User);

      const result = await service.linkGuestToSocial(userId, profile);

      expect(guestUser.provider).toBe(profile.provider);
      expect(guestUser.providerId).toBe(profile.id);
      expect(guestUser.email).toBe(profile.email);
      expect(guestUser.provider).toBe(profile.provider);
      expect(userRepository.save).toHaveBeenCalledWith(guestUser);
      expect(result).toEqual({ user: guestUser, isNew: false });
    });
  });

  describe('updateUserBehaviorRatio', () => {
    it('유저의 행동 비율을 업데이트한다', async () => {
      const userId = 'user-id';
      const ratio = 0.8;
      userRepository.update.mockResolvedValue({} as any);

      await service.updateUserBehaviorRatio(userId, ratio);

      expect(userRepository.update).toHaveBeenCalledWith({ id: userId }, { behaviorRatio: ratio });
    });
  });
});
