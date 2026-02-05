import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ERROR_MESSAGE_PREFIX } from '@web24/shared';
import { z, type ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      let message = 'Validation failed';
      if (result.error.message.startsWith(ERROR_MESSAGE_PREFIX)) {
        message = result.error.message;
      }
      throw new BadRequestException({
        message,
        errors: z.treeifyError(result.error),
      });
    }

    return result.data;
  }
}
