import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';
import { GoalController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalService } from './goal.service';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { AIBehavior } from '../behavior/ai-behavior.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Behavior, TodayBehavior, AIBehavior, User])],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
