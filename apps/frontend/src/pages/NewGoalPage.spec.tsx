import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NewGoalPage } from './NewGoalPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const mockTemplates = [
  {
    id: 'template-1',
    title: '건강',
    level: {
      마음열기: ['물 한 컵 마시기'],
      시작하기: ['스트레칭 5분'],
      이어가기: ['주 2회 운동'],
      몰입하기: ['헬스장 1시간'],
    },
  },
];

const behaviorSelectionMock = vi.fn();
const templateSelectionMock = vi.fn();

vi.mock('@/features/goal/hooks/useGoalTemplates', () => ({
  useGoalTemplates: () => ({
    templates: mockTemplates,
    error: null,
    loading: false,
  }),
}));

vi.mock('@/features/goal/components/BehaviorSelection', () => ({
  BehaviorSelection: ({ behaviors }: { behaviors: Array<{ title: string }> }) => {
    behaviorSelectionMock({ behaviors });
    return <div data-testid="behavior-selection" />;
  },
}));

vi.mock('@/features/goal/components/TemplateSelection', () => ({
  TemplateSelection: ({ onSelect }: { onSelect: (id: string) => void }) => {
    templateSelectionMock({ onSelect });
    return (
      <button type="button" onClick={() => onSelect('template-1')}>
        템플릿 선택
      </button>
    );
  },
}));

vi.mock('@/features/goal/components/NewGoal', () => ({
  NewGoal: () => <div>목표 작성 폼</div>,
}));

vi.mock('@/features/goal/components/NewGoalFrame', () => ({
  NewGoalFrame: ({
    currStepIdx,
    steps,
    onMove,
  }: {
    currStepIdx: number;
    steps: Array<{ content: React.ReactNode }>;
    onMove: (idx: number) => void;
  }) => (
    <div>
      <div data-testid="step-content">{steps[currStepIdx].content}</div>
      <button type="button" onClick={() => onMove(currStepIdx + 1)}>
        다음
      </button>
    </div>
  ),
}));

describe('NewGoalPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    behaviorSelectionMock.mockClear();
    templateSelectionMock.mockClear();
  });

  it('템플릿 선택 화면을 렌더링한다', () => {
    render(<NewGoalPage />);

    expect(screen.getByRole('button', { name: '템플릿 선택' })).toBeInTheDocument();
  });

  it('템플릿을 선택하면 행동 목록을 채운다', () => {
    let idCounter = 0;
    const randomUUID = vi.fn(() => {
      const id = `uuid-${idCounter}`;
      idCounter += 1;
      return id;
    });
    vi.stubGlobal('crypto', { randomUUID } as unknown as Crypto);

    render(<NewGoalPage />);

    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    const lastCall = behaviorSelectionMock.mock.calls.at(-1);
    expect(lastCall).toBeTruthy();
    const behaviors = lastCall?.[0].behaviors ?? [];
    expect(behaviors.map((item: { title: string }) => item.title)).toEqual(['물 한 컵 마시기']);
  });
});
