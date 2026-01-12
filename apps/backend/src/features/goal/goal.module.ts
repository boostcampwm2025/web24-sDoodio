import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';
import { GoalController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalService } from './goal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Behavior, User])],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
