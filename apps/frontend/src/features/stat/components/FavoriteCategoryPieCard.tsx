import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

type CategoryStat = {
  name: string;
  count: number;
  color: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function CategoryRow({
  item,
  onClick,
}: {
  item: CategoryStat;
  onClick: (item: CategoryStat) => void;
}) {
  return (
    <li>
      <button
        className="group flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm transition-colors hover:bg-gray-50"
        type="button"
        onClick={() => onClick(item)}
      >
        <span className="inline-flex items-center gap-2 text-gray-800">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="hidden font-semibold text-gray-900 sm:inline">
            {formatNumber(item.count)}회
          </span>
          <span className="inline-flex items-center text-gray-400 sm:hidden">
            <ChevronRight
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
              size={16}
            />
          </span>
        </span>
      </button>
    </li>
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function donutSegmentPath({
  cx,
  cy,
  outerRadius,
  innerRadius,
  startAngle,
  endAngle,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  startAngle: number;
  endAngle: number;
}) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

function DonutChart({
  data,
  size,
  thickness,
}: {
  data: CategoryStat[];
  size?: number;
  thickness?: number;
}) {
  const safeSize = size ?? 180;
  const safeThickness = thickness ?? 18;
  const total = data.reduce((acc, cur) => acc + cur.count, 0);

  const radius = safeSize / 2;
  const outerRadius = radius - 2;
  const innerRadius = Math.max(0, outerRadius - safeThickness);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<CategoryStat | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  let currentAngle = 0;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        aria-label="최애 TOP 4 카테고리 분포 파이차트"
        className="h-auto w-full max-w-[220px]"
        height={safeSize}
        role="img"
        viewBox={`0 0 ${safeSize} ${safeSize}`}
        width={safeSize}
      >
        <title>최애 TOP 4 카테고리 분포</title>
        <circle cx={radius} cy={radius} fill="white" r={outerRadius} />
        <circle cx={radius} cy={radius} className="fill-gray-100" r={outerRadius} />
        {total > 0 &&
          data.map((item) => {
            const slice = (item.count / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + slice;
            currentAngle += slice;

            const path = donutSegmentPath({
              cx: radius,
              cy: radius,
              outerRadius,
              innerRadius,
              startAngle,
              endAngle,
            });

            const isHovered = hovered?.name === item.name;
            const isDimmed = hovered ? !isHovered : false;

            return (
              <path
                key={item.name}
                className="cursor-pointer"
                d={path}
                fill={item.color}
                stroke="white"
                strokeWidth={2}
                style={{
                  opacity: isDimmed ? 0.45 : 1,
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: `${radius}px ${radius}px`,
                  transition: 'transform 150ms ease, opacity 150ms ease',
                }}
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log('[stats] category slice click', item.name, item.count);
                }}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => {
                  setHovered(null);
                  setTooltip(null);
                }}
                onMouseMove={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
              />
            );
          })}

        <circle cx={radius} cy={radius} fill="white" r={innerRadius} />
        <text
          className="fill-gray-900 text-[12px] font-semibold"
          dominantBaseline="middle"
          textAnchor="middle"
          x={radius}
          y={radius - 3}
        >
          이번 달의
        </text>
        <text
          className="fill-gray-900 text-[16px] font-bold"
          dominantBaseline="middle"
          textAnchor="middle"
          x={radius}
          y={radius + 15}
        >
          관심
        </text>
      </svg>

      {hovered && tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-md"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hovered.color }} />
            <span className="font-semibold">{hovered.name}</span>
            <span className="text-gray-500">{formatNumber(hovered.count)}회</span>
          </div>
        </div>
      )}
    </div>
  );
}

DonutChart.defaultProps = {
  size: 180,
  thickness: 18,
};

export function FavoriteCategoryPieCard({ categories }: { categories: CategoryStat[] }) {
  const favoriteTotal = categories.reduce((acc, cur) => acc + cur.count, 0);
  const topCategory = [...categories].sort((a, b) => b.count - a.count)[0];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">최애 TOP4 카테고리</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {topCategory?.name ?? '-'} · {formatNumber(topCategory?.count ?? 0)}회
        </span>
      </header>

      <div className="mt-5 grid gap-5 md:grid-cols-[240px_1fr] md:items-center">
        <div className="flex justify-center">
          <DonutChart data={categories} />
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            가장 많이 한 카테고리는{' '}
            <span className="font-semibold text-gray-900">{topCategory?.name}</span>이에요.
          </p>
          <ul className="space-y-2">
            {categories
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <CategoryRow
                  item={item}
                  key={item.name}
                  onClick={(clicked) => {
                    // eslint-disable-next-line no-console
                    console.log('[stats] category row click', clicked.name, clicked.count);
                  }}
                />
              ))}
          </ul>
          <p className="text-xs text-gray-500">
            총 {formatNumber(favoriteTotal)}회 기록이 모였어요.
          </p>
        </div>
      </div>
    </section>
  );
}

export type { CategoryStat };
