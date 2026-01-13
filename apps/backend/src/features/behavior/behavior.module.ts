import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BehaviorController } from './behavior.controller';
import { TodayBehaviorController } from './today-behavior.controller';
import { BehaviorService } from './behavior.service';
import { Behavior } from './behavior.entity';
import { Goal } from '../goal/goal.entity';
import { TodayBehavior } from './today-behavior.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Behavior, Goal, TodayBehavior])],
  controllers: [BehaviorController, TodayBehaviorController],
  providers: [BehaviorService],
})
export class BehaviorModule {}
