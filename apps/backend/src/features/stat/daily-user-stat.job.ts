/* eslint-disable max-classes-per-file */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BatchJob,
  ExecutionContext,
  job,
  type ItemProcessor,
  type ItemReader,
  type ItemWriter,
  type JobParameters,
  StepFactory,
} from '@web24/batch';
import { addDays, getKstDayKey } from '../../common/utils/time.utils';
import { User } from '../user/user.entity';
import { DailyUserStat } from './daily-user-stat.entity';
import { StatService } from './stat.service';

const DAILY_USER_STAT_JOB = 'daily_user_stat';
const DAILY_USER_STAT_STEP = 'daily_user_stat_step';
const DEFAULT_CHUNK_SIZE = 50;
const WEEK_DAYS = 7;

type DailyUserStatDates = {
  todayKey: string;
  yesterDayKey: string;
  weekStartKey: string;
};

type DailyUserStatUpsertInput = Awaited<ReturnType<StatService['buildDailyUserStatInput']>>;

class UserIdReader implements ItemReader<string> {
  constructor(private readonly userRepository: Repository<User>) {}

  async open(ctx: ExecutionContext): Promise<void> {
    const params = ctx.get<JobParameters>('jobParameters') ?? {};
    const todayKey =
      typeof params.todayKey === 'string' ? params.todayKey : getKstDayKey(new Date());
    const yesterDayKey =
      typeof params.yesterDayKey === 'string'
        ? params.yesterDayKey
        : getKstDayKey(addDays(new Date(), -1));
    const weekStartKey =
      typeof params.weekStartKey === 'string'
        ? params.weekStartKey
        : getKstDayKey(addDays(new Date(), -WEEK_DAYS));

    ctx.set<DailyUserStatDates>('dailyUserStatDates', {
      todayKey,
      yesterDayKey,
      weekStartKey,
    });
  }

  async read(
    ctx: ExecutionContext,
    chunkSize: number,
    manager?: Repository<User>['manager'],
  ): Promise<string[]> {
    const lastUserId = ctx.get<string>('lastUserId');
    const repo = manager?.getRepository(User) ?? this.userRepository;
    const qb = repo
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .orderBy('user.id', 'ASC')
      .limit(chunkSize);
    if (lastUserId) {
      qb.where('user.id > :lastUserId', { lastUserId });
    }

    const rows = await qb.getRawMany<{ id: string }>();
    const userIds = rows.map((row) => row.id);

    if (userIds.length > 0) {
      ctx.set('lastUserId', userIds.at(-1));
    }

    return userIds;
  }

  async close(): Promise<void> {
    /* 특별한 처리 필요 없음 */
  }
}

class DailyUserStatProcessor implements ItemProcessor<string, DailyUserStatUpsertInput> {
  constructor(private readonly statService: StatService) {}

  async process(userId: string, ctx: ExecutionContext): Promise<DailyUserStatUpsertInput> {
    const dates = ctx.get<DailyUserStatDates>('dailyUserStatDates');
    if (!dates) {
      throw new Error('Missing dailyUserStatDates in execution context');
    }
    return this.statService.buildDailyUserStatInput(userId, dates);
  }
}

class DailyUserStatWriter implements ItemWriter<DailyUserStatUpsertInput> {
  constructor(private readonly dailyUserStatRepository: Repository<DailyUserStat>) {}

  async write(
    items: DailyUserStatUpsertInput[],
    _ctx: ExecutionContext,
    manager?: Repository<DailyUserStat>['manager'],
  ): Promise<void> {
    if (items.length === 0) return;
    const repo = manager?.getRepository(DailyUserStat) ?? this.dailyUserStatRepository;
    await repo.upsert(items, ['user', 'statDate']);
  }
}

@BatchJob(DAILY_USER_STAT_JOB)
@Injectable()
export class DailyUserStatJob {
  constructor(
    private readonly stepFactory: StepFactory,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DailyUserStat)
    private readonly dailyUserStatRepository: Repository<DailyUserStat>,
    private readonly statService: StatService,
  ) {}

  buildJob() {
    return job(DAILY_USER_STAT_JOB)
      .step(
        this.stepFactory.chunk(
          DAILY_USER_STAT_STEP,
          new UserIdReader(this.userRepository),
          new DailyUserStatProcessor(this.statService),
          new DailyUserStatWriter(this.dailyUserStatRepository),
          { chunkSize: DEFAULT_CHUNK_SIZE },
        ),
      )
      .build();
  }
}
