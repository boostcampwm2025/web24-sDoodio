import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatEventLog } from './stat-event-log.entity';
import { DailyUserStat } from './daily-user-stat.entity';
import { StatService } from './stat.service';
import { User } from '../user/user.entity';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';
import { Behavior } from '../behavior/behavior.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TodayBehavior, DailyUserStat, StatEventLog, Goal, Behavior]),
  ],
  controllers: [],
  providers: [StatService],
})
export class StatModule {}
