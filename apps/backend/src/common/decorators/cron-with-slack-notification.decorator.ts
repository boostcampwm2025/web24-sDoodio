import { Cron, CronOptions } from '@nestjs/schedule';
import type { SlackService } from '../slack/slack.service';

type SlackNotifyHolder = {
  getSlackNotifyService?: () => SlackService | undefined;
};

export function CronWithSlackNotification(
  cronTime: string | Date,
  options?: CronOptions,
): MethodDecorator {
  return <T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    // 메서드 래핑으로 @Cron 메타데이터가 원래 함수에만 남아 스케줄러가 크론을 못 찾는다.
    // 그래서,
    // 1) 원래 함수 메타데이터를 래퍼 함수에 복사하고
    // 2) @Cron을 래퍼 함수가 들어있는 descriptor에 적용한다.
    const original = descriptor.value as unknown as (...args: any[]) => Promise<unknown>;
    const wrapped = async function notifySlackCronWrapper(this: unknown, ...args: any[]) {
      const start = Date.now();
      const slackNotifyService = (this as SlackNotifyHolder).getSlackNotifyService?.();
      const jobName =
        options?.name ??
        `${typeof target === 'function' ? target.name : (target?.constructor?.name ?? 'Unknown')}.${String(
          propertyKey,
        )}`;

      await slackNotifyService?.send(
        `[Cron] ${jobName} (${String(cronTime)}) - START - ${new Date(start).toISOString()}`,
      );

      try {
        const result = await original.apply(this, args);
        await slackNotifyService?.send(
          `[Cron] ${jobName} (${String(cronTime)}) - SUCCESS - ${Date.now() - start}ms`,
        );
        return result;
      } catch (error) {
        await slackNotifyService?.send(
          `[Cron] ${jobName} (${String(cronTime)}) - FAIL - ${Date.now() - start}ms`,
        );
        throw error;
      }
    } as unknown as T;

    const updatedDescriptor: TypedPropertyDescriptor<T> = {
      ...descriptor,
      value: wrapped,
    };

    // 1) 원래 함수 메타데이터를 래퍼 함수에 복사
    const metadataKeys = Reflect.getMetadataKeys(original);
    metadataKeys.forEach((key) => {
      const value = Reflect.getMetadata(key, original);
      Reflect.defineMetadata(key, value, wrapped as unknown as object);
    });

    // 2) @Cron을 래퍼 함수가 들어있는 descriptor에 적용
    Cron(cronTime, options)(target, propertyKey, updatedDescriptor);

    return updatedDescriptor;
  };
}
