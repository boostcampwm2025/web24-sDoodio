import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import useAuthStore from '@/stores/useAuthStore';
import { ensureWebPushSubscribed } from '@/features/push/hooks/useAutoWebPushSubscribe';
import { LoginPage } from './LoginPage';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

vi.mock('@/stores/useAuthStore');
vi.mock('@/features/push/hooks/useAutoWebPushSubscribe', () => ({
  ensureWebPushSubscribed: vi.fn().mockResolvedValue(true),
}));

describe('LoginPage', () => {
  const mockLoginGuest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: null,
      fetchMe: vi.fn().mockResolvedValue(null),
      loginGuest: mockLoginGuest,
      isLoading: false,
      error: null,
    });
  });

  it('Google 로그인 버튼을 클릭하면 Google Auth URL로 이동한다', () => {
    // Window location hack for test environment
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<LoginPage />);

    const googleBtn = screen.getByText('Google로 로그인');
    fireEvent.click(googleBtn);

    expect(window.location.href).toBe('/api/auth/google');

    // Restore location
    window.location = originalLocation as any;
  });

  it('게스트 로그인 버튼을 클릭하면 loginGuest와 ensureWebPushSubscribed가 호출된다', async () => {
    render(<LoginPage />);

    const guestBtn = screen.getByText('게스트로 시작하기');
    fireEvent.click(guestBtn);

    expect(mockLoginGuest).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(ensureWebPushSubscribed).toHaveBeenCalled();
    });
  });

  it('신규 유저(isNewUser: true)인 경우 온보딩 페이지로 이동한다', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { kind: 'guest', isNewUser: true },
      fetchMe: vi.fn(),
      isLoading: false,
    });

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
  });

  it('기존 유저(isNewUser가 없는 경우)는 원래 페이지(기본값: /)로 이동한다', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { kind: 'user' }, // isNewUser undefined
      fetchMe: vi.fn(),
      isLoading: false,
    });

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
