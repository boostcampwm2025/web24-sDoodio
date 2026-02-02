import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { LangGraphService } from './lang-graph.service';

@Module({
  providers: [AIService, LangGraphService],
  exports: [AIService, LangGraphService],
})
export class AIModule {}
