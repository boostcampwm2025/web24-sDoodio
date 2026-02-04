import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  private readonly webhookUrl?: string;

  constructor(configService: ConfigService) {
    this.webhookUrl = configService.get<string>('SLACK_WEBHOOK_URL');
  }

  async send(text: string) {
    if (!this.webhookUrl) {
      this.logger.debug('SLACK_WEBHOOK_URL is not set. Skip slack notification.');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`Slack webhook failed: ${response.status} ${body}`);
      }
    } catch (error) {
      this.logger.error('Slack webhook request failed', error as Error);
    }
  }
}
