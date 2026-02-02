import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import type { UserMeResponse } from '@web24/shared';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';
import { User } from '../user/user.entity';

interface PassportUser extends User {
  isNew: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('guest')
  async guestLogin(@Req() req: Request) {
    if (req.session.userId) {
      throw new BadRequestException('Already logged in');
    }
    const user = await this.authService.createGuestUser();
    req.session.userId = user.id;
    req.session.isGuest = user.kind === 'guest';
    return { ...user, isNewUser: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // AuthGuard('google') 이용해서 리다이렉트
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as PassportUser;
    req.session.userId = user.id;
    req.session.isGuest = false;

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    if (user.isNew) {
      return res.redirect(`${frontendUrl}/onboarding`);
    }
    return res.redirect(`${frontendUrl}`);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@UserId() userId: string): Promise<UserMeResponse> {
    const user = await this.authService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      kind: user.kind,
      email: user.email,
      behaviorRatio: user.behaviorRatio,
    };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard)
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

  @Patch('settings/behavior-ratio')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard)
  async updateBehaviorRatio(
    @UserId() userId: string,
    @Body('behaviorRatio') behaviorRatio: number,
  ) {
    await this.authService.updateUserBehaviorRatio(userId, behaviorRatio);
    return { success: true };
  }
}
