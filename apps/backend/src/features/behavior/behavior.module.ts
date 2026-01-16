import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from '../ai/ai.module';
import { BehaviorController } from './behavior.controller';
import { TodayBehaviorController } from './today-behavior.controller';
import { BehaviorService } from './behavior.service';
import { Behavior } from './behavior.entity';
import { Goal } from '../goal/goal.entity';
import { TodayBehavior } from './today-behavior.entity';
import { AIBehavior } from './ai-behavior.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Behavior, Goal, TodayBehavior, AIBehavior]), AIModule],
  controllers: [BehaviorController, TodayBehaviorController],
  providers: [BehaviorService],
})
export class BehaviorModule {}
