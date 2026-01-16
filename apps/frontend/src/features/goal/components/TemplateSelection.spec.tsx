import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateSelection } from './TemplateSelection';

describe('TemplateSelection', () => {
  const templates = [
    {
      id: 'template-1',
      title: '건강',
      level: {
        마음열기: ['물 한 컵 마시기'],
        시작하기: ['스트레칭 5분'],
        이어가기: ['주 2회 운동'],
        몰입하기: ['헬스장 1시간'],
      },
    },
    {
      id: 'template-2',
      title: '공부',
      level: {
        마음열기: ['책 펼치기'],
        시작하기: ['10분 읽기'],
        이어가기: ['30분 집중'],
        몰입하기: ['1시간 정리'],
      },
    },
  ];

  it('템플릿 목록과 직접 추가하기 버튼을 렌더링한다', () => {
    render(
      <TemplateSelection
        selectedTemplateId={null}
        customTemplateId="custom-template"
        templates={templates}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '건강' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '공부' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '직접 추가하기' })).toBeInTheDocument();
  });

  it('템플릿 버튼 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn();

    render(
      <TemplateSelection
        selectedTemplateId={null}
        customTemplateId="custom-template"
        templates={templates}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '공부' }));
    expect(onSelect).toHaveBeenCalledWith('template-2');
  });

  it('직접 추가하기 버튼 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn();

    render(
      <TemplateSelection
        selectedTemplateId={null}
        customTemplateId="custom-template"
        templates={templates}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '직접 추가하기' }));
    expect(onSelect).toHaveBeenCalledWith('custom-template');
  });

  it('선택된 템플릿은 aria-pressed가 true다', () => {
    render(
      <TemplateSelection
        selectedTemplateId="template-1"
        customTemplateId="custom-template"
        templates={templates}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '건강' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '공부' })).toHaveAttribute('aria-pressed', 'false');
  });
});
