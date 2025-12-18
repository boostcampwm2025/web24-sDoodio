import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { BEHAVIOR_CATEGORIES } from '@/shared/constants/behaviorCategory';
import { useBehaviorCategoryStore } from '@/stores/useBehaviorCategoryStore';
import { useBehaviorPoolStore } from '@/stores/useBehaviorPoolStore';
import { BehaviorPoolFab } from '@/features/behaviorPool/components/BehaviorPoolFab';
import { BehaviorPoolPage } from './BehaviorPoolPage';

describe('BehaviorPoolPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useBehaviorPoolStore.setState({ items: [] });
    useBehaviorCategoryStore.setState({ items: BEHAVIOR_CATEGORIES.map((c) => ({ ...c })) });
  });

  it('renders empty state', () => {
    render(
      <>
        <BehaviorPoolPage />
        <BehaviorPoolFab />
      </>,
    );
    expect(screen.getByText('행동이 없습니다.')).toBeInTheDocument();
  });

  it('renders behavior items from store', () => {
    useBehaviorPoolStore.getState().add({
      title: '물 마시기',
      categoryId: 'health',
      description: '하루 2L 목표',
      identityStatement: '꾸준히 건강을 챙기는 사람',
      isAiRecommended: true,
      isRandomRecommended: true,
    });

    render(
      <>
        <BehaviorPoolPage />
        <BehaviorPoolFab />
      </>,
    );
    expect(screen.getByText('물 마시기')).toBeInTheDocument();
    expect(screen.getByText('하루 2L 목표')).toBeInTheDocument();
    expect(screen.getByText('꾸준히 건강을 챙기는 사람')).toBeInTheDocument();
  });

  it('opens create dialog from FAB and adds an item', async () => {
    const user = userEvent.setup();

    render(
      <>
        <BehaviorPoolPage />
        <BehaviorPoolFab />
      </>,
    );

    await user.click(screen.getByLabelText('행동 추가 메뉴'));
    await user.click(screen.getByText('새로운 행동 추가'));

    await user.type(screen.getByPlaceholderText('예: 물 마시기'), '아침 산책');
    await user.click(screen.getByRole('button', { name: '추가' }));

    expect(screen.getByText('아침 산책')).toBeInTheDocument();
  });

  it('요일 선택에 따라 랜덤 추천 토글이 자동으로 변경', async () => {
    const user = userEvent.setup();

    render(
      <>
        <BehaviorPoolPage />
        <BehaviorPoolFab />
      </>,
    );

    await user.click(screen.getByLabelText('행동 추가 메뉴'));
    await user.click(screen.getByText('새로운 행동 추가'));

    expect(screen.getByRole('button', { name: 'ON' })).toBeDisabled();

    await user.click(screen.getByLabelText('월'));
    expect(screen.getByRole('button', { name: 'OFF' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'OFF' }));
    expect(screen.getByRole('button', { name: 'ON' })).toBeEnabled();

    await user.click(screen.getByLabelText('화'));
    expect(screen.getByRole('button', { name: 'OFF' })).toBeEnabled();
  });

  it('카테고리 관리 모달에서 카테고리를 추가할 수 있다', async () => {
    const user = userEvent.setup();

    render(
      <>
        <BehaviorPoolPage />
        <BehaviorPoolFab />
      </>,
    );

    await user.click(screen.getByLabelText('행동 추가 메뉴'));
    await user.click(screen.getByText('새로운 행동 추가'));

    await user.click(screen.getByLabelText('카테고리 관리'));
    expect(screen.getByText('카테고리 관리')).toBeInTheDocument();
    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('예: 업무'), '업무');
    await user.click(screen.getByRole('button', { name: '추가' }));

    await user.click(screen.getByRole('button', { name: '돌아가기' }));
    expect(screen.getByRole('option', { name: '업무' })).toBeInTheDocument();
  });
});
