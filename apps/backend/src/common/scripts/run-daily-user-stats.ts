import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { StatService } from '../../features/stat/stat.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const statService = app.get(StatService);
    await statService.calculateDailyUserStats();
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
