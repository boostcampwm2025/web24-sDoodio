import { NotFoundException } from '@nestjs/common';
import type { CreateGoalRequest } from '@web24/shared';
import { DataSource } from 'typeorm';
import { GoalService } from './goal.service';
import { Behavior } from '../behavior/behavior.entity';
import { Goal } from './goal.entity';
import { User } from '../user/user.entity';

describe('GoalService', () => {
  type TransactionManager = {
    getRepository: (entity: Function) => unknown;
  };

  const request: CreateGoalRequest = {
    goalTitle: '건강',
    goalColor: 'blue',
    behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
  };

  it('목표 목록을 반환한다', async () => {
    const user = { id: 'user-1', nickname: '테스트유저' };
    const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

    const goals = [
      { id: 'goal-1', title: '건강', color: 'mint', user },
      { id: 'goal-2', title: '독서', color: 'beige', user },
    ];
    const goalRepository = { find: jest.fn().mockResolvedValue(goals) };

    const dataSource = {
      getRepository: jest.fn((entity: Function) => {
        if (entity === User) return userRepository;
        if (entity === Goal) return goalRepository;
        return null;
      }),
    } as unknown as DataSource;

    const service = new GoalService(dataSource);

    await expect(service.getGoals()).resolves.toEqual(goals);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { nickname: '테스트유저' } });
    expect(goalRepository.find).toHaveBeenCalledWith({ where: { user: { id: user.id } } });
  });

  it('유저가 없으면 getGoals가 NotFoundException을 던진다', async () => {
    const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
    const goalRepository = { find: jest.fn() };

    const dataSource = {
      getRepository: jest.fn((entity: Function) => {
        if (entity === User) return userRepository;
        if (entity === Goal) return goalRepository;
        return null;
      }),
    } as unknown as DataSource;

    const service = new GoalService(dataSource);

    await expect(service.getGoals()).rejects.toBeInstanceOf(NotFoundException);
    expect(goalRepository.find).not.toHaveBeenCalled();
  });

  it('유저가 없으면 NotFoundException을 던진다', async () => {
    const userRepository = { findOne: jest.fn().mockResolvedValue(null) };
    const goalRepository = { create: jest.fn(), save: jest.fn() };
    const behaviorRepository = { create: jest.fn(), save: jest.fn() };

    const manager = {
      getRepository: jest.fn((entity: Function) => {
        if (entity === User) return userRepository;
        if (entity === Goal) return goalRepository;
        if (entity === Behavior) return behaviorRepository;
        return null;
      }),
    };

    const dataSource = {
      transaction: jest.fn((callback: (manager: TransactionManager) => Promise<unknown>) =>
        callback(manager),
      ),
    } as unknown as DataSource;

    const service = new GoalService(dataSource);

    await expect(service.createGoal(request)).rejects.toBeInstanceOf(NotFoundException);
    expect(goalRepository.save).not.toHaveBeenCalled();
  });

  it('목표와 행동을 저장하고 응답을 반환한다', async () => {
    const user = { id: 'user-1', nickname: '테스트유저' };
    const userRepository = { findOne: jest.fn().mockResolvedValue(user) };

    const goal = { title: request.goalTitle, color: request.goalColor, user };
    const savedGoal = {
      id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      ...goal,
    };

    const goalRepository = {
      create: jest.fn().mockReturnValue(goal),
      save: jest.fn().mockResolvedValue(savedGoal),
    };

    const behavior = {
      title: request.behaviors[0].title,
      difficulty: request.behaviors[0].difficulty,
      goal: savedGoal,
    };
    const savedBehavior = {
      id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
      ...behavior,
    };

    const behaviorRepository = {
      create: jest.fn().mockReturnValue(behavior),
      save: jest.fn().mockResolvedValue([savedBehavior]),
    };

    const manager = {
      getRepository: jest.fn((entity: Function) => {
        if (entity === User) return userRepository;
        if (entity === Goal) return goalRepository;
        if (entity === Behavior) return behaviorRepository;
        return null;
      }),
    };

    const dataSource = {
      transaction: jest.fn((callback: (manager: TransactionManager) => Promise<unknown>) =>
        callback(manager),
      ),
    } as unknown as DataSource;

    const service = new GoalService(dataSource);

    await expect(service.createGoal(request)).resolves.toEqual({
      id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      title: '건강',
      color: 'blue',
      behaviors: [
        {
          id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
          title: '물 한 컵 마시기',
          difficulty: '마음열기',
        },
      ],
    });
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { nickname: '테스트유저' } });
    expect(goalRepository.create).toHaveBeenCalledWith({
      title: request.goalTitle,
      color: request.goalColor,
      user,
    });
    expect(goalRepository.save).toHaveBeenCalledWith(goal);
    expect(behaviorRepository.create).toHaveBeenCalledWith({
      title: request.behaviors[0].title,
      difficulty: request.behaviors[0].difficulty,
      goal: savedGoal,
    });
    expect(behaviorRepository.save).toHaveBeenCalledWith([behavior]);
  });
});
