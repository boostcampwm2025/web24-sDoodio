import { z } from 'zod';

import { StatsResponseSchema } from '../schemas/stat.schemas';

export type StatsResponse = z.infer<typeof StatsResponseSchema>;
