import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import useAuthStore from '@/stores/useAuthStore';
import { MENU_ITEMS } from '@/shared/constants/menu';
import DesktopHeader from './DesktopHeader';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));
vi.mock('@/stores/useAuthStore');
vi.mock('@/shared/hooks/useScroll', () => ({
  useScroll: () => false,
}));

describe('DesktopHeader', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { nickname: 'User' },
      logout: mockLogout,
    });
  });

  it('렌더링 시 로고와 메뉴가 표시된다', () => {
    render(<DesktopHeader />);
    expect(screen.getByText('Doowell')).toBeInTheDocument();
    MENU_ITEMS.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('프로필 아이콘 클릭 시 드롭다운 메뉴가 열린다', () => {
    render(<DesktopHeader />);

    const profileBtn = screen.getByText('U'); // User nickname first char
    fireEvent.click(profileBtn);

    expect(screen.getByText('마이페이지')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('로그아웃 클릭 시 로그아웃 함수가 호출되고 로그인 페이지로 이동한다', async () => {
    render(<DesktopHeader />);

    const profileBtn = screen.getByText('U');
    fireEvent.click(profileBtn);

    const logoutBtn = screen.getByText('로그아웃');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('마이페이지 클릭 시 마이페이지로 이동한다', () => {
    render(<DesktopHeader />);

    const profileBtn = screen.getByText('U');
    fireEvent.click(profileBtn);

    const myPageBtn = screen.getByText('마이페이지');
    fireEvent.click(myPageBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/mypage');
  });
});
