import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DodoSpeechBubble } from './DodoSpeechBubble';

describe('DodoSpeechBubble', () => {
  it('텍스트가 있으면 말풍선을 표시한다', () => {
    render(<DodoSpeechBubble text="안녕하세요" />);

    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('텍스트가 없으면 아무 것도 렌더링하지 않는다', () => {
    const { container } = render(<DodoSpeechBubble />);

    expect(container).toBeEmptyDOMElement();
  });
});
