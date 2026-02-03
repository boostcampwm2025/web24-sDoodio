/* eslint-disable global-require */
import 'reflect-metadata';
import { CronWithSlackNotification } from './cron-with-slack-notification.decorator';
import { SlackService } from '../slack/slack.service';

describe('CronWithSlackNotification', () => {
  class TestService {
    constructor(private readonly slackService: SlackService) {}

    getSlackNotifyService() {
      return this.slackService;
    }

    // eslint-disable-next-line class-methods-use-this
    @CronWithSlackNotification('0 * * * * *', { name: 'test_cron' })
    async run() {
      return 'ok';
    }
  }

  it('래핑된 메서드에 크론 메타데이터를 유지한다', () => {
    const method = TestService.prototype.run;
    const metadataKeys = Reflect.getMetadataKeys(method);

    expect(metadataKeys.length).toBeGreaterThan(0);
  });

  it('메타데이터가 래핑된 메서드에 복사된다', () => {
    const method = TestService.prototype.run;
    const keys = Reflect.getMetadataKeys(method);
    const values = keys.map((key) => Reflect.getMetadata(key, method));

    expect(keys.length).toBeGreaterThan(0);
    expect(values.every((value) => value !== undefined)).toBe(true);
  });

  it('Cron 데코레이터를 올바른 인자로 호출한다', () => {
    jest.isolateModules(() => {
      jest.doMock('@nestjs/schedule', () => {
        const actual = jest.requireActual('@nestjs/schedule');
        return { ...actual, Cron: jest.fn(() => () => undefined) };
      });

      const { Cron } = require('@nestjs/schedule') as typeof import('@nestjs/schedule');
      const { CronWithSlackNotification: CronWithSlackNotificationMocked } =
        require('./cron-with-slack-notification.decorator') as typeof import('./cron-with-slack-notification.decorator');

      const cronTime = '0 * * * * *';
      const options = { name: 'test_cron' };

      const target = {
        async run() {
          return 'ok';
        },
      };
      const descriptor = Object.getOwnPropertyDescriptor(target, 'run');
      CronWithSlackNotificationMocked(cronTime, options)(
        target,
        'run',
        descriptor as PropertyDescriptor,
      );

      const CronMock = Cron as unknown as jest.Mock;
      expect(CronMock).toHaveBeenCalledWith(cronTime, options);
      expect(CronMock).toHaveBeenCalledTimes(1);
    });
  });
});
