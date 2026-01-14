import { Controller, Get } from '@nestjs/common';
import { BehaviorService } from './behavior.service';

@Controller('behaviors') // MEMO: s 추가하기, 추가한 후 프론트 엔드포인트, OPEN API 문서 경로 변경하기
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  // MEMO: 현재는 임시, 나중에 today-behavior.controller 로 이동
  @Get()
  async getTodayBehaviors() {
    return this.behaviorService.getTodayBehaviors();
  }

  @Get('all')
  async getAllBehaviors() {
    return this.behaviorService.getAllBehaviors();
  }
}
