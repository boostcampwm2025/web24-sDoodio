import { ERROR_MESSAGE_PREFIX } from './some.constants';

export const GOAL_TITLE_MAX_LENGTH = 20;

export const GOAL_ERROR_MESSAGES = {
  title_length: `${ERROR_MESSAGE_PREFIX}목표명은 1보다 크고 ${GOAL_TITLE_MAX_LENGTH}보다 작아야 해.`,
  duplicate_goal_title: `${ERROR_MESSAGE_PREFIX}중복된 목표명이 있는데 확인해보자.`,
  empty_actions_by_difficulty: `${ERROR_MESSAGE_PREFIX}각 난이도에는 최소 1개 이상의 행동이 필요해.`,
  duplicate_action_title_in_goal: `${ERROR_MESSAGE_PREFIX}목표 안에 중복된 행동이 있는데 확인해보자.`,
};
