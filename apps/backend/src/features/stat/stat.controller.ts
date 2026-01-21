import { Controller, Get } from '@nestjs/common';
import * as Shared from '@web24/shared';

@Controller('stats')
export class StatController {
  @Get('difficulty')
  getDifficultyStats(): Shared.GetDifficultyStatsResponse {
    // 최근 7일간의 mock 데이터 반환
    return [
      { 마음열기: 2, 시작하기: 3, 이어가기: 1, 몰입하기: 0, AI: 0 },
      { 마음열기: 1, 시작하기: 2, 이어가기: 4, 몰입하기: 2, AI: 0 },
      { 마음열기: 0, 시작하기: 0, 이어가기: 0, 몰입하기: 0, AI: 0 }, // 0회인 경우
      { 마음열기: 3, 시작하기: 1, 이어가기: 2, 몰입하기: 5, AI: 0 },
      { 마음열기: 1, 시작하기: 1, 이어가기: 1, 몰입하기: 1, AI: 0 },
      { 마음열기: 4, 시작하기: 2, 이어가기: 3, 몰입하기: 1, AI: 0 },
      { 마음열기: 2, 시작하기: 4, 이어가기: 2, 몰입하기: 3, AI: 0 },
    ];
  }
}
