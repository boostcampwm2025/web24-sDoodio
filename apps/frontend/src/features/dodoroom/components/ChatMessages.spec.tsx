import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChatMessages } from './ChatMessages';

const messages = [
  { id: 'm1', role: 'dodo', text: '안녕' },
  { id: 'm2', role: 'user', text: '반가워' },
] as const;

describe('ChatMessages', () => {
  it('메시지 목록을 렌더링한다', () => {
    render(<ChatMessages messages={messages} />);

    expect(screen.getByText('안녕')).toBeInTheDocument();
    expect(screen.getByText('반가워')).toBeInTheDocument();
  });
});
