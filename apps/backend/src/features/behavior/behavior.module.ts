import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BehaviorController } from './behavior.controller';
import { BehaviorService } from './behavior.service';
import { Behavior } from './behavior.entity';
import { Goal } from '../goal/goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Behavior, Goal])],
  controllers: [BehaviorController],
  providers: [BehaviorService],
})
export class BehaviorModule {}
