import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DEFAULT_BEHAVIOR_EXTRACTION_RATIO } from '@web24/shared';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { User } from '../user/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createGuestUser: jest.fn(),
            getUserById: jest.fn(),
            updateUserRatio: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('컨트롤러가 정의된다', () => {
    expect(controller).toBeDefined();
  });

  describe('guestLogin', () => {
    it('게스트 로그인 시 세션에 유저 정보를 저장한다', async () => {
      const user = { id: 'user-id', kind: 'guest' } as User;
      authService.createGuestUser.mockResolvedValue(user);
      const req = { session: {} } as Request;

      const result = await controller.guestLogin(req);

      expect(authService.createGuestUser).toHaveBeenCalled();
      expect(req.session.userId).toBe('user-id');
      expect(req.session.isGuest).toBe(true);
      expect(result).toEqual({ ...user, isNewUser: true });
    });

    it('이미 로그인 상태면 400을 반환한다', async () => {
      const req = { session: { userId: 'user-id' } } as Request;

      await expect(controller.guestLogin(req)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('me', () => {
    it('유저를 찾지 못하면 401을 반환한다', async () => {
      authService.getUserById.mockResolvedValue(null);

      await expect(controller.me('user-id')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('세션 기반으로 유저 정보를 반환한다', async () => {
      const user = {
        id: 'user-id',
        nickname: 'G-abcd12',
        kind: 'guest',
        behaviorRatio: DEFAULT_BEHAVIOR_EXTRACTION_RATIO,
      } as User;
      authService.getUserById.mockResolvedValue(user);

      const result = await controller.me('user-id');

      expect(authService.getUserById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({
        id: user.id,
        nickname: user.nickname,
        kind: user.kind,
        behaviorRatio: DEFAULT_BEHAVIOR_EXTRACTION_RATIO,
      });
    });
  });

  describe('logout', () => {
    it('세션을 파기하고 쿠키를 제거한다', async () => {
      const destroy = jest.fn((cb: (err?: Error) => void) => cb());
      const req = { session: { destroy } } as unknown as Request;
      const res = { clearCookie: jest.fn() } as unknown as Response;

      const result = await controller.logout(req, res);

      expect(destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
      expect(result).toEqual({ success: true });
    });
  });
});
