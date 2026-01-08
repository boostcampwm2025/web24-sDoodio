import { Test, TestingModule } from '@nestjs/testing';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

describe('GoalController', () => {
  let controller: GoalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalController],
      providers: [
        {
          provide: GoalService,
          useValue: {
            createGoal: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GoalController>(GoalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
