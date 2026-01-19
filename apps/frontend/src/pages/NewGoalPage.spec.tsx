import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { NewGoalPage } from './NewGoalPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
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
const createGoalMock = vi.fn();

vi.mock('@/features/goal/hooks/useGoalTemplates', () => ({
  useGoalTemplates: () => ({
    templates: mockTemplates,
    error: null,
    loading: false,
  }),
}));

vi.mock('@/features/goal/components/BehaviorSelection', () => ({
  BehaviorSelection: ({
    behaviors,
    onAdd,
    onDelete,
    onChangeBehaviorTitle,
  }: {
    behaviors: Array<{ title: string }>;
    onAdd: () => void;
    onDelete: (id: string) => void;
    onChangeBehaviorTitle: (id: string, title: string) => void;
  }) => {
    behaviorSelectionMock({ behaviors, onAdd, onDelete, onChangeBehaviorTitle });
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
  NewGoal: ({
    title,
    setTitle,
    setColor,
  }: {
    title: string;
    setTitle: (value: string) => void;
    setColor: (
      value:
        | 'blue'
        | 'light-pink'
        | 'pink'
        | 'yellow'
        | 'sand'
        | 'mint'
        | 'gray-mint'
        | 'warm-gray'
        | 'beige'
        | 'lavender',
    ) => void;
  }) => (
    <div>
      <div data-testid="goal-title">{title}</div>
      <button type="button" onClick={() => setTitle('새 목표')}>
        제목 설정
      </button>
      <button type="button" onClick={() => setColor('blue')}>
        색상 설정
      </button>
    </div>
  ),
}));

vi.mock('@/features/goal/apis/createGoal.api', () => ({
  createGoal: (...args: unknown[]) => createGoalMock(...args),
}));

vi.mock('@/features/goal/components/NewGoalFrame', () => ({
  NewGoalFrame: ({
    currStepIdx,
    steps,
    onMove,
    onComplete,
    onSkip,
  }: {
    currStepIdx: number;
    steps: Array<{ content: React.ReactNode }>;
    onMove: (idx: number) => void;
    onComplete: () => void;
    onSkip: () => void;
  }) => (
    <div>
      <div data-testid="step-content">{steps[currStepIdx].content}</div>
      <button type="button" onClick={() => onMove(currStepIdx - 1)}>
        이전
      </button>
      <button type="button" onClick={() => onMove(currStepIdx + 1)}>
        다음
      </button>
      <button type="button" onClick={onSkip}>
        스킵
      </button>
      <button type="button" onClick={onComplete}>
        완료
      </button>
    </div>
  ),
}));

describe('NewGoalPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_LOCK_CREATE_GOAL', 'false');
    let idCounter = 0;
    const randomUUID = vi.fn(() => {
      const id = `uuid-${idCounter}`;
      idCounter += 1;
      return id;
    });
    vi.stubGlobal('crypto', { randomUUID } as unknown as Crypto);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    behaviorSelectionMock.mockClear();
    templateSelectionMock.mockClear();
    createGoalMock.mockReset();
    navigateMock.mockReset();
  });

  it('템플릿 선택 화면을 렌더링한다', () => {
    render(<NewGoalPage />);

    expect(screen.getByRole('button', { name: '템플릿 선택' })).toBeInTheDocument();
  });

  it('템플릿을 선택하면 행동 목록을 채운다', () => {
    render(<NewGoalPage />);

    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    const lastCall = behaviorSelectionMock.mock.calls.at(-1);
    expect(lastCall).toBeTruthy();
    const behaviors = lastCall?.[0].behaviors ?? [];
    expect(behaviors.map((item: { title: string }) => item.title)).toEqual(['물 한 컵 마시기']);
  });

  it('완료 시 목표 생성 요청과 이동을 수행한다', async () => {
    createGoalMock.mockResolvedValueOnce({
      id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      title: '새 목표',
      color: 'blue',
      behaviors: [],
    });

    render(<NewGoalPage />);

    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    fireEvent.click(screen.getByRole('button', { name: '제목 설정' }));
    fireEvent.click(screen.getByRole('button', { name: '색상 설정' }));

    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await fireEvent.click(screen.getByRole('button', { name: '완료' }));

    expect(createGoalMock).toHaveBeenCalledWith({
      goalTitle: '새 목표',
      goalColor: 'blue',
      behaviors: expect.arrayContaining([
        expect.objectContaining({ title: '물 한 컵 마시기', difficulty: '마음열기' }),
        expect.objectContaining({ title: '스트레칭 5분', difficulty: '시작하기' }),
        expect.objectContaining({ title: '주 2회 운동', difficulty: '이어가기' }),
        expect.objectContaining({ title: '헬스장 1시간', difficulty: '몰입하기' }),
      ]),
    });
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('목표 생성에 실패하면 이동하지 않는다', async () => {
    createGoalMock.mockRejectedValueOnce(new Error('실패'));

    render(<NewGoalPage />);

    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '제목 설정' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    fireEvent.click(screen.getByRole('button', { name: '완료' }));

    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});
