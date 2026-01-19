import { Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { UserMeResponse } from '@web24/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  async guestLogin(@Req() req: Request) {
    const user = await this.authService.createGuestUser();
    req.session.userId = user.id;
    req.session.isGuest = user.kind === 'guest';
    return user;
  }

  @Get('me')
  async me(@Req() req: Request): Promise<UserMeResponse> {
    const { userId } = req.session;
    if (!userId) {
      throw new UnauthorizedException('Not logged in');
    }
    const user = await this.authService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      kind: user.kind,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    res.clearCookie('connect.sid');
    return { success: true };
  }
}
