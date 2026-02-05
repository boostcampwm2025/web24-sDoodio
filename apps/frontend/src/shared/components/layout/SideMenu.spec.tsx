import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import useAuthStore from '@/stores/useAuthStore';
import SideMenu from './SideMenu';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock('@/stores/useAuthStore');

describe('SideMenu', () => {
  const mockLogout = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue({
      user: { nickname: 'User' },
      logout: mockLogout,
    });
    // Remove the router require hack
  });

  it('isOpen이 true일 때 메뉴가 보인다', () => {
    render(<SideMenu isOpen onClose={mockOnClose} />);

    expect(screen.getByText('메뉴')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('마이페이지 클릭 시 이동하고 닫힌다', () => {
    render(<SideMenu isOpen onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('마이페이지'));

    expect(mockNavigate).toHaveBeenCalledWith('/mypage');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('로그아웃 클릭 시 로그아웃 호출 후 이동하고 닫힌다', async () => {
    render(<SideMenu isOpen onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('로그아웃'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    render(<SideMenu isOpen onClose={mockOnClose} />);

    // The overlay is the first div with specific classes
    const overlay = screen.getByRole('presentation', { hidden: true });
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
