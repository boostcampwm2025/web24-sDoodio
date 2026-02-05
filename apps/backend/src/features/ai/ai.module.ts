import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { LangGraphService } from './lang-graph.service';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TodayBehavior, Goal, User])],
  providers: [AIService, LangGraphService],
  exports: [AIService],
})
export class AIModule {}
