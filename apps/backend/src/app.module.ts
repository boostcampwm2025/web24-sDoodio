import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppEntitySample } from './app.sample.entity';
import { AppService } from './app.service';
import { User } from './features/user/user.entity';
import { GoalModule } from './features/goal/goal.module';
import { BehaviorModule } from './features/behavior/behavior.module';
import { AIModule } from './features/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production.local', '.env.development.local'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().port().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        CLOVA_API_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.getOrThrow('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.getOrThrow<number>('DB_PORT'),
          username: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASS'),
          database: config.getOrThrow<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
          logging: !isProd,
        };
      },
    }),
    TypeOrmModule.forFeature([AppEntitySample, User]),
    GoalModule,
    BehaviorModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
