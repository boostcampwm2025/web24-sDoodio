import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../auth.service';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case 'GOOGLE_CLIENT_ID':
                  return 'test-client-id';
                case 'GOOGLE_CLIENT_SECRET':
                  return 'test-client-secret';
                case 'GOOGLE_CALLBACK_URL':
                  return 'http://localhost:3000/auth/google/callback';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            linkGuestToSocial: jest.fn(),
            findOrCreateSocialUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get(AuthService);
  });

  it('전략이 정의된다', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const profile = {
      id: 'google-id',
      name: { givenName: 'GoogleUser' },
      emails: [{ value: 'test@google.com' }],
    } as Profile;

    const expectedSocialProfile = {
      provider: 'google',
      id: 'google-id',
      email: 'test@google.com',
      nickname: 'GoogleUser',
    };

    const done = jest.fn();

    it('세션에 userId가 있으면 게스트 계정 연동을 시도한다', async () => {
      const req = { session: { userId: 'guest-id' } } as any;
      const user = { id: 'guest-id', kind: 'user' };
      authService.linkGuestToSocial.mockResolvedValue({ user: user as any, isNew: false });

      await strategy.validate(req, 'token', 'refresh', profile, done);

      expect(authService.linkGuestToSocial).toHaveBeenCalledWith('guest-id', expectedSocialProfile);
      expect(done).toHaveBeenCalledWith(null, { ...user, isNew: false });
    });

    it('세션에 userId가 없으면 소셜 유저 찾기/생성을 시도한다', async () => {
      const req = { session: {} } as any;
      const user = { id: 'new-user', kind: 'user' };
      authService.findOrCreateSocialUser.mockResolvedValue({ user: user as any, isNew: true });

      await strategy.validate(req, 'token', 'refresh', profile, done);

      expect(authService.findOrCreateSocialUser).toHaveBeenCalledWith(expectedSocialProfile);
      expect(done).toHaveBeenCalledWith(null, { ...user, isNew: true });
    });
  });
});
