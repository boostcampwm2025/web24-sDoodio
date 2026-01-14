import type { GoalColor } from '@web24/shared';

export const GOAL_COLOR_STYLES: Record<
  GoalColor,
  { bg: string; ring: string; border: string; borderHover: string }
> = {
  'light-pink': {
    bg: 'bg-goal-light-pink',
    ring: 'ring-goal-light-pink',
    border: 'border-goal-light-pink/20',
    borderHover: 'hover:border-goal-light-pink/70',
  },
  pink: {
    bg: 'bg-goal-pink',
    ring: 'ring-goal-pink',
    border: 'border-goal-pink/20',
    borderHover: 'hover:border-goal-pink/70',
  },
  yellow: {
    bg: 'bg-goal-yellow',
    ring: 'ring-goal-yellow',
    border: 'border-goal-yellow/20',
    borderHover: 'hover:border-goal-yellow/70',
  },
  sand: {
    bg: 'bg-goal-sand',
    ring: 'ring-goal-sand',
    border: 'border-goal-sand/20',
    borderHover: 'hover:border-goal-sand/70',
  },
  mint: {
    bg: 'bg-goal-mint',
    ring: 'ring-goal-mint',
    border: 'border-goal-mint/20',
    borderHover: 'hover:border-goal-mint/70',
  },
  blue: {
    bg: 'bg-goal-blue',
    ring: 'ring-goal-blue',
    border: 'border-goal-blue/20',
    borderHover: 'hover:border-goal-blue/70',
  },
  'gray-mint': {
    bg: 'bg-goal-gray-mint',
    ring: 'ring-goal-gray-mint',
    border: 'border-goal-gray-mint/20',
    borderHover: 'hover:border-goal-gray-mint/70',
  },
  'warm-gray': {
    bg: 'bg-goal-warm-gray',
    ring: 'ring-goal-warm-gray',
    border: 'border-goal-warm-gray/20',
    borderHover: 'hover:border-goal-warm-gray/70',
  },
  beige: {
    bg: 'bg-goal-beige',
    ring: 'ring-goal-beige',
    border: 'border-goal-beige/20',
    borderHover: 'hover:border-goal-beige/70',
  },
  lavender: {
    bg: 'bg-goal-lavender',
    ring: 'ring-goal-lavender',
    border: 'border-goal-lavender/20',
    borderHover: 'hover:border-goal-lavender/70',
  },
};
