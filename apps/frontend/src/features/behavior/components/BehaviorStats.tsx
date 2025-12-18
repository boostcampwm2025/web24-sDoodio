import { MapPin, Sun, TrendingUp } from 'lucide-react';

function BehaviorStats() {
  return (
    <div className="h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-800">
        <TrendingUp size={20} className="text-green-600" />
        습관 분석 리포트
      </h3>
      <div className="space-y-3">
        {/* 날씨 기반 피드백 */}
        <div className="flex items-start gap-3 p-3">
          <Sun className="mt-0.5 shrink-0 text-orange-500" size={18} />
          <p className="text-sm font-medium text-gray-700">
            맑은 날씨에 실행 확률이 20% 올라갑니다.
          </p>
        </div>

        {/* 위치 기반 피드백 */}
        <div className="flex items-start gap-3 p-3">
          <MapPin className="mt-0.5 shrink-0 text-purple-500" size={18} />
          <p className="text-sm font-medium text-gray-700">
            낯선 장소에서는 평소보다 실행을 주저하는 편이에요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BehaviorStats;
