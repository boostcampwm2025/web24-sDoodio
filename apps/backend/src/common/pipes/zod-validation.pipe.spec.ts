import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string().trim(),
    age: z.number().int().positive(),
  });

  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('검증에 성공하면 파싱된 값을 반환한다', () => {
    const input = { name: '  Alice  ', age: 3 };

    const result = pipe.transform(input);

    expect(result).toEqual({ name: 'Alice', age: 3 });
  });

  it('검증에 실패하면 treeify된 에러와 함께 BadRequestException을 던진다', () => {
    const invalidInput = { name: '', age: -1 };

    const parseResult = schema.safeParse(invalidInput);
    if (parseResult.success) {
      throw new Error('유효하지 않은 입력이므로 실패해야 합니다');
    }

    const expectedErrors = z.treeifyError(parseResult.error);

    expect.assertions(3);

    try {
      pipe.transform(invalidInput);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getStatus()).toBe(400);
      expect((error as BadRequestException).getResponse()).toEqual({
        message: 'Validation failed',
        errors: expectedErrors,
      });
    }
  });
});
