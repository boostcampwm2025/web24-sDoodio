import { z } from 'zod';
import { CATEGORY_COLOR_VALUES } from '../constants/category.constants';

export const StatsPeriodSchema = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
});

export const StatsTotalsSchema = z.object({
  allTimeCount: z.number().int().nonnegative(),
  monthCount: z.number().int().nonnegative(),
  prevMonthCount: z.number().int().nonnegative(),
});

export const StatsCategorySchema = z.object({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  color: z.enum(CATEGORY_COLOR_VALUES),
  count: z.number().int().nonnegative(),
});

export const StatsActionSchema = z.object({
  behaviorId: z.string().min(1),
  title: z.string().min(1),
});

export const WeekdaySchema = z.enum(['월', '화', '수', '목', '금', '토', '일']);

export const StatsInsightBestWeekdaySchema = z.object({
  weekday: WeekdaySchema,
  actions: z.array(StatsActionSchema),
});

export const StatsInsightBestTimeSchema = z.object({
  timeBucket: z.string().min(1),
  actions: z.array(StatsActionSchema),
});

export const StatsInsightWeatherHintSchema = z.object({
  weather: z.string().min(1),
  message: z.string().min(1).optional(),
  actions: z.array(StatsActionSchema),
});

export const StatsInsightFocusVsOthersSchema = z.object({
  label: z.string().min(1),
  basis: z.enum(['category', 'meta']),
  itemId: z.string().min(1).optional(),
  itemName: z.string().min(1),
  actions: z.array(StatsActionSchema),
});

export const StatsInsightsSchema = z.object({
  bestWeekday: StatsInsightBestWeekdaySchema,
  bestTime: StatsInsightBestTimeSchema,
  weatherHint: StatsInsightWeatherHintSchema,
  focusVsOthers: StatsInsightFocusVsOthersSchema,
});

export const StatsResponseSchema = z.object({
  period: StatsPeriodSchema,
  totals: StatsTotalsSchema,
  categories: z.array(StatsCategorySchema),
  insights: StatsInsightsSchema,
  generatedAt: z.iso.datetime().optional(),
});
