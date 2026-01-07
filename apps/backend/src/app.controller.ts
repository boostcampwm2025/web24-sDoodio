import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSampleSchema, type CreateSampleRequest } from '@web24/shared';
import { AppEntitySample } from './app.sample.entity';
import { AppService } from './app.service';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(AppEntitySample)
    private readonly samplesRepository: Repository<AppEntitySample>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('samples')
  async createSample(
    @Body(new ZodValidationPipe(CreateSampleSchema)) body: CreateSampleRequest,
  ): Promise<AppEntitySample> {
    const sample = this.samplesRepository.create({ name: body.name });
    return this.samplesRepository.save(sample);
  }
}
