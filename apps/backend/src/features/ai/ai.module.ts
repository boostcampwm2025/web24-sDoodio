import { Module } from '@nestjs/common';
import { AIService } from './ai.service';

@Module({
  providers: [AIService],
  exports: [AIModule],
})
export class AIModule {}
