import { Inject, Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import session from 'express-session';
import type { RequestHandler } from 'express';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

import { GoalModule } from './features/goal/goal.module';
import { BehaviorModule } from './features/behavior/behavior.module';
import { AIModule } from './features/ai/ai.module';
import { AuthModule } from './features/auth/auth.module';
import { StatModule } from './features/stat/stat.module';

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
        SESSION_SECRET: Joi.string().required(),
        SESSION_MAX_AGE_MS: Joi.number().required(),
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
    GoalModule,
    BehaviorModule,
    AIModule,
    AuthModule,
    StatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.getOrThrow<number>('DB_PORT'),
          user: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASS'),
          database: config.getOrThrow<string>('DB_NAME'),
        }),
    },
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly configService: ConfigService,
    @Inject('PG_POOL') private readonly pool: Pool,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const isProd = this.configService.getOrThrow('NODE_ENV') === 'production';
    const PgSessionStore = connectPgSimple(session);

    const sessionMiddleware: RequestHandler = session({
      store: new PgSessionStore({
        pool: this.pool,
        tableName: 'user_sessions',
        createTableIfMissing: false,
      }),
      secret: this.configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: this.configService.getOrThrow<number>('SESSION_MAX_AGE_MS'),
      },
    });

    consumer.apply(sessionMiddleware).forRoutes('*');
  }
}
