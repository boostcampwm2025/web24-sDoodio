import { render, screen, fireEvent } from '@testing-library/react';
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
    recommendations,
    onAdd,
    onDelete,
    onChangeBehaviorTitle,
  }: any) => {
    behaviorSelectionMock({ behaviors, recommendations, onAdd, onDelete, onChangeBehaviorTitle });
    return (
      <div data-testid="behavior-selection">
        {recommendations?.map((rec: string) => (
          <button key={rec} type="button" onClick={() => onAdd(rec)}>
            추천추가: {rec}
          </button>
        ))}
        <button type="button" onClick={() => onAdd()}>
          직접추가
        </button>
      </div>
    );
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
  NewGoal: ({ title, setTitle, setColor }: any) => (
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
  NewGoalFrame: ({ currStepIdx, steps, onMove, onComplete, onSkip }: any) => (
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

vi.mock('@/features/goal/components/SummaryView', () => ({
  SummaryView: () => <div data-testid="summary-view" />,
}));

describe('NewGoalPage', () => {
  beforeEach(() => {
    let idCounter = 0;
    const randomUUID = vi.fn(() => {
      const id = `uuid-${idCounter}`;
      idCounter += 1;
      return id;
    });
    vi.stubGlobal('crypto', { randomUUID } as unknown as Crypto);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('템플릿 선택 화면을 렌더링한다', () => {
    render(<NewGoalPage />);
    expect(screen.getByRole('button', { name: '템플릿 선택' })).toBeInTheDocument();
  });

  it('템플릿을 선택하고 추천 항목을 클릭하면 행동 목록에 추가된다', async () => {
    render(<NewGoalPage />);

    // 템플릿 선택
    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));

    // 스텝 이동
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // 추천 항목 클릭하여 추가
    fireEvent.click(screen.getByRole('button', { name: '추천추가: 물 한 컵 마시기' }));

    const lastCall = behaviorSelectionMock.mock.calls.at(-1);
    expect(lastCall).toBeTruthy();
    const behaviors = lastCall?.[0].behaviors ?? [];
    expect(behaviors.map((item: any) => item.title)).toContain('물 한 컵 마시기');
  });

  it('완료 시 각 단계에서 추가된 행동들로 목표 생성 요청을 수행한다', async () => {
    createGoalMock.mockResolvedValueOnce({ id: 'goal-id' });

    render(<NewGoalPage />);

    // Step 1: 템플릿 선택
    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 2: 제목 설정
    fireEvent.click(screen.getByRole('button', { name: '제목 설정' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 3: 마음열기 추천 추가
    fireEvent.click(screen.getByRole('button', { name: '추천추가: 물 한 컵 마시기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 4: 시작하기 추천 추가
    fireEvent.click(screen.getByRole('button', { name: '추천추가: 스트레칭 5분' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 5: 이어가기 추천 추가
    fireEvent.click(screen.getByRole('button', { name: '추천추가: 주 2회 운동' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 6: 몰입하기 추천 추가
    fireEvent.click(screen.getByRole('button', { name: '추천추가: 헬스장 1시간' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // Step 7: 최종 확인 및 완료
    await fireEvent.click(screen.getByRole('button', { name: '완료' }));

    expect(createGoalMock).toHaveBeenCalledWith({
      goalTitle: '새 목표',
      goalColor: expect.any(String),
      templateId: 'template-1',
      behaviors: expect.arrayContaining([
        { title: '물 한 컵 마시기', difficulty: '마음열기' },
        { title: '스트레칭 5분', difficulty: '시작하기' },
        { title: '주 2회 운동', difficulty: '이어가기' },
        { title: '헬스장 1시간', difficulty: '몰입하기' },
      ]),
    });
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('행동을 하나도 입력하지 않으면 다음 단계로 넘어갈 수 없다 (Validation)', async () => {
    render(<NewGoalPage />);

    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '제목 설정' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    // 행동 추가 없이 다음 클릭
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByTestId('behavior-selection')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
