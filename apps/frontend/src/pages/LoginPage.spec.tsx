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

  it('게스트 로그인 버튼을 클릭하면 loginGuest가 호출되고 온보딩으로 이동한다', async () => {
    render(<LoginPage />);

    const guestBtn = screen.getByText('게스트로 시작하기');
    fireEvent.click(guestBtn);

    expect(mockLoginGuest).toHaveBeenCalled();
    // Wait for async operations in handleGuestLogin
    await vi.waitFor(() => {
      expect(ensureWebPushSubscribed).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
    });
  });

  it('이미 로그인된 유저라면 자동으로 리다이렉트한다', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { kind: 'google' },
      fetchMe: vi.fn(),
      isLoading: false,
    });

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
