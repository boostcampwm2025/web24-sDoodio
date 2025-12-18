import BehaviorStamp from '@/features/behavior/components/BehaviorStamp';
import BehaviorHeader from '@/features/behavior/components/BehaviorHeader';
import { useBehaviorDetail } from '@/features/behavior/hooks/useBehaviorDetail';
import BehaviorStats from '@/features/behavior/components/BehaviorStats';
import WaterBottle from '@/features/behavior/components/WaterBottle';

function BehaviorDetailPage() {
  const { behavior, progress, toggleAdd, stamp } = useBehaviorDetail();

  return (
    <>
      <BehaviorHeader info={behavior} onToggleAdd={toggleAdd} />

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
        <div className="h-full min-h-[400px]">
          <WaterBottle progress={progress} badgeCount={behavior.totalStamps} />
        </div>
        <div className="flex h-full flex-col gap-6 lg:gap-8">
          <div className="flex-1">
            <BehaviorStamp info={behavior} onStamp={stamp} />
          </div>
          <div className="flex-1">
            <BehaviorStats />
          </div>
        </div>
      </div>
    </>
  );
}

export default BehaviorDetailPage;
