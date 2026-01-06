import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppEntitySample } from './app.sample.entity';
import { AppService } from './app.service';

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
  async createSample(@Body('name') name: string): Promise<AppEntitySample> {
    const sample = this.samplesRepository.create({ name });
    return this.samplesRepository.save(sample);
  }
}
