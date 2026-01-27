import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('버튼 클릭 시 onSend를 호출한다', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(<ChatInput value="hi" canSend onChange={onChange} onSend={onSend} />);

    fireEvent.click(screen.getByRole('button', { name: '보내기' }));

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('엔터 입력 시 onSend를 호출한다', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(<ChatInput value="hi" canSend onChange={onChange} onSend={onSend} />);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('입력 변경 시 onChange를 호출한다', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(<ChatInput value="" canSend={false} onChange={onChange} onSend={onSend} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '두두' } });

    expect(onChange).toHaveBeenCalledWith('두두');
  });
});
