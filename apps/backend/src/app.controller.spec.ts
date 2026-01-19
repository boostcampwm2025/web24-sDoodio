import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppEntitySample } from './app.sample.entity';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let samplesRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    samplesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(AppEntitySample),
          useValue: samplesRepository,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('"Hello World!"를 반환한다', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('samples', () => {
    it('샘플을 생성한다', async () => {
      const body = { name: 'sample' };
      const created = { name: body.name };
      const saved: AppEntitySample = {
        id: 'sample-id',
        name: body.name,
        createdAt: new Date(),
      };

      samplesRepository.create.mockReturnValue(created);
      samplesRepository.save.mockResolvedValue(saved);

      await expect(appController.createSample(body)).resolves.toBe(saved);
      expect(samplesRepository.create).toHaveBeenCalledWith({ name: body.name });
      expect(samplesRepository.save).toHaveBeenCalledWith(created);
    });
  });
});
