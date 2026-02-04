import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import useAuthStore from '@/stores/useAuthStore';
import { MyPage } from './MyPage';

// Mock dependencies
vi.mock('@/stores/useAuthStore');
vi.mock('@/features/setting/components/TodayBehaviorRatioSlider', () => ({
  TodayBehaviorRatioSlider: () => <div data-testid="slider">Slider Mock</div>,
}));

describe('MyPage', () => {
  const mockUpdateBehaviorRatio = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('유저가 없으면 아무것도 렌더링하지 않는다', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: null,
      updateBehaviorRatio: mockUpdateBehaviorRatio,
    });

    const { container } = render(<MyPage />);
    expect(container.firstChild).toBeNull();
  });

  it('유저 정보를 올바르게 표시한다', () => {
    const user = {
      nickname: 'TestUser',
      kind: 'user',
      provider: 'google',
      email: 'test@example.com',
      behaviorRatio: 0.5,
    };
    (useAuthStore as unknown as Mock).mockReturnValue({
      user,
      updateBehaviorRatio: mockUpdateBehaviorRatio,
    });

    render(<MyPage />);

    expect(screen.getByText('마이페이지')).toBeInTheDocument();
    expect(screen.getAllByText('TestUser')[0]).toBeInTheDocument(); // Header and detail
    expect(screen.getByText('google 계정')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('게스트 유저일 경우 계정 연동 섹션을 표시한다', () => {
    const user = {
      nickname: 'GuestUser',
      kind: 'guest',
      email: null,
      behaviorRatio: 0.5,
    };
    (useAuthStore as unknown as Mock).mockReturnValue({
      user,
      updateBehaviorRatio: mockUpdateBehaviorRatio,
    });

    render(<MyPage />);

    expect(screen.getByText('계정 연동')).toBeInTheDocument();
    expect(screen.getByText('Google 계정으로 계속하기')).toBeInTheDocument();
  });

  it('일반 유저일 경우 계정 연동 섹션을 표시하지 않는다', () => {
    const user = {
      nickname: 'NormalUser',
      kind: 'user',
      provider: 'google',
      email: 'test@example.com',
      behaviorRatio: 0.5,
    };
    (useAuthStore as unknown as Mock).mockReturnValue({
      user,
      updateBehaviorRatio: mockUpdateBehaviorRatio,
    });

    render(<MyPage />);

    expect(screen.queryByText('계정 연동')).not.toBeInTheDocument();
  });

  it('Google 연동 버튼 클릭 시 href 이동한다', () => {
    const user = {
      nickname: 'GuestUser',
      kind: 'guest',
      email: null,
      behaviorRatio: 0.5,
    };
    (useAuthStore as unknown as Mock).mockReturnValue({
      user,
      updateBehaviorRatio: mockUpdateBehaviorRatio,
    });

    // Window location hack for test environment
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<MyPage />);

    const linkBtn = screen.getByText('Google 계정으로 계속하기');
    fireEvent.click(linkBtn);

    expect(window.location.href).toBe('/api/auth/google');

    // Restore location
    window.location = originalLocation as any;
  });
});
