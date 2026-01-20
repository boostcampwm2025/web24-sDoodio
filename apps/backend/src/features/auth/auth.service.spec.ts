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
});
