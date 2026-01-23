import type { ReactNode } from 'react';

type StatInsightCardShellProps = {
  main: string;
  sub?: string;
  children?: ReactNode;
};

export function StatInsightCardShell({ main, sub, children }: StatInsightCardShellProps) {
  return (
    <div className="border-primary-weak/60 bg-bg-light/80 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-body-1 font-semibold">{main}</p>
        <p className="text-caption-1 text-label-alternative">{sub}</p>
        {children}
      </div>
    </div>
  );
}
