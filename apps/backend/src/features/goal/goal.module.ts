import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';

@Module({
  controllers: [GoalController],
})
export class GoalModule {}
