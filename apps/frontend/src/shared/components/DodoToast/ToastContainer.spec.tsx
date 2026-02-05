import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import useDodoToastStore from '@/stores/useDodoToastStore';
import DodoToastContainer from './ToastContainer';

// useDodoToastStore 모킹
vi.mock('@/stores/useDodoToastStore', () => ({
  default: vi.fn(),
}));

const mockUseDodoToastStore = useDodoToastStore as unknown as Mock;

describe('DodoToastContainer', () => {
  const mockRemoveToast = vi.fn();

  const mockStore = (toasts: any[] = []) => {
    mockUseDodoToastStore.mockReturnValue({
      toasts,
      removeToast: mockRemoveToast,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('토스트가 없을 때 아무것도 렌더링하지 않아야 한다', () => {
    mockStore([]);

    const { container } = render(<DodoToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('스토어의 토스트를 렌더링해야 한다', () => {
    mockStore([
      {
        id: 'toast-1',
        message: '첫 번째 토스트',
        duration: 3000,
        position: 'bottom',
      },
    ]);

    render(<DodoToastContainer />);
    expect(screen.getByText('첫 번째 토스트')).toBeInTheDocument();
  });

  it('여러 개의 토스트를 렌더링해야 한다', () => {
    mockStore([
      {
        id: 'toast-1',
        message: '첫 번째 토스트',
        duration: 3000,
        position: 'top',
      },
      {
        id: 'toast-2',
        message: '두 번째 토스트',
        duration: 3000,
        position: 'bottom',
      },
    ]);

    render(<DodoToastContainer />);
    expect(screen.getByText('첫 번째 토스트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 토스트')).toBeInTheDocument();
  });

  it('다양한 위치의 토스트 메시지를 렌더링해야 한다', () => {
    mockStore([
      {
        id: 'toast-1',
        message: '상단 토스트',
        duration: 3000,
        position: 'top',
      },
      {
        id: 'toast-2',
        message: '하단 토스트',
        duration: 3000,
        position: 'bottom',
      },
      {
        id: 'toast-3',
        message: '좌측 토스트',
        duration: 3000,
        position: 'left',
      },
      {
        id: 'toast-4',
        message: '우측 토스트',
        duration: 3000,
        position: 'right',
      },
    ]);

    render(<DodoToastContainer />);
    expect(screen.getByText('상단 토스트')).toBeInTheDocument();
    expect(screen.getByText('하단 토스트')).toBeInTheDocument();
    expect(screen.getByText('좌측 토스트')).toBeInTheDocument();
    expect(screen.getByText('우측 토스트')).toBeInTheDocument();
  });

  it('여러 토스트가 각각 정상적으로 렌더링된다', () => {
    mockStore([
      {
        id: 'toast-unique-1',
        message: '토스트 1',
        duration: 3000,
        position: 'bottom',
      },
      {
        id: 'toast-unique-2',
        message: '토스트 2',
        duration: 3000,
        position: 'bottom',
      },
    ]);

    render(<DodoToastContainer />);
    expect(screen.getByText('토스트 1')).toBeInTheDocument();
    expect(screen.getByText('토스트 2')).toBeInTheDocument();
  });
});
