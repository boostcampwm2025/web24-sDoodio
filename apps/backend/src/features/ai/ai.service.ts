import { Injectable } from '@nestjs/common';
import { Goal } from '../goal/goal.entity';

@Injectable()
export class AIService {
  async getAIBehaviorTitles(goal: Goal): Promise<string[]> {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    return [`AI가 만든 새 행동 이름 ${goal.title}`];
  }
}
