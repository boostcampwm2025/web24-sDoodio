import { BEHAVIOR_DIFFICULTIES, BehaviorDifficulty } from '../types/behavior.types';
import { z } from '../zod';

export const DifficultyStatsSchema = z.record(z.enum(BEHAVIOR_DIFFICULTIES), z.number());
export type DifficultyStats = Record<BehaviorDifficulty, number>;

export const GetDifficultyStatsResponseSchema = z.array(DifficultyStatsSchema);
export type GetDifficultyStatsResponse = DifficultyStats[];
