import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

let storeState: {
  user: { id: string; nickname: string; kind: 'guest' | 'user' } | null;
  fetchMe: () => Promise<unknown>;
  loginGuest: () => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('@/stores/useAuthStore', () => ({
  default: () => storeState,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseLocation.mockReturnValue({ state: { from: { pathname: '/from' } } });
    storeState = {
      user: null,
      fetchMe: vi.fn().mockResolvedValue(null),
      loginGuest: vi.fn().mockResolvedValue(null),
      isLoading: false,
      error: null,
    };
  });

  it('로그인 화면이 렌더링된다', () => {
    render(<LoginPage />);

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '게스트로 시작하기' })).toBeInTheDocument();
  });

  it('로그인 상태가 아니면 세션 조회를 시도한다', async () => {
    render(<LoginPage />);

    await waitFor(() => expect(storeState.fetchMe).toHaveBeenCalled());
  });

  it('로그인 상태면 이전 경로로 이동한다', async () => {
    storeState.user = {
      id: '019bd5d8-72dc-78ca-af5d-c93358058b32',
      nickname: 'G-abcd12',
      kind: 'user',
    };

    render(<LoginPage />);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/from', { replace: true }));
  });

  it('게스트 로그인 버튼을 누르면 로그인 요청 후 이동한다', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: '게스트로 시작하기' }));

    await waitFor(() => expect(storeState.loginGuest).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true }),
    );
  });

  it('에러가 있으면 메시지를 보여준다', () => {
    storeState.error = '로그인 실패';

    render(<LoginPage />);

    expect(screen.getByText('로그인 실패')).toBeInTheDocument();
  });
});
