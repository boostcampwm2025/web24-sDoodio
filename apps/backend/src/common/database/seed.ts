/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { AppDataSource } from './data-source';
import { User } from '../../features/user/user.entity';
import { Goal } from '../../features/goal/goal.entity';
import { Behavior } from '../../features/behavior/behavior.entity';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const goalRepo = AppDataSource.getRepository(Goal);
  const behaviorRepo = AppDataSource.getRepository(Behavior);

  const nickname = '테스트유저';
  let user = await userRepo.findOne({ where: { nickname } });
  if (!user) {
    user = await userRepo.save(userRepo.create({ nickname }));
  }

  const goalsData = [
    { title: '건강한 생활', color: 'mint' },
    { title: '드로잉 마스터', color: 'beige' },
    { title: '개발 서적', color: 'lavender' },
  ];

  const goals: Record<string, Goal> = {};
  for (const g of goalsData) {
    let goal = await goalRepo.findOne({
      where: { title: g.title, user: { id: user.id } },
      relations: { user: true },
    });
    if (!goal) {
      goal = goalRepo.create({ ...g, color: g.color as Goal['color'], user });
      goal = await goalRepo.save(goal);
    }
    goals[g.title] = goal;
  }

  const behaviorsData = [
    { title: '물 1컵 마시기', difficulty: '마음열기', goalTitle: '건강한 생활' },
    { title: '스트레칭 5분', difficulty: '시작하기', goalTitle: '건강한 생활' },
    { title: '선 긋기 연습', difficulty: '이어하기', goalTitle: '드로잉 마스터' },
    { title: '스케치 10분', difficulty: '몰입하기', goalTitle: '드로잉 마스터' },
    { title: '30분 독서', difficulty: '시작하기', goalTitle: '개발 서적' },
    { title: '요약 노트 작성', difficulty: '이어하기', goalTitle: '개발 서적' },
  ];

  for (const b of behaviorsData) {
    const goal = goals[b.goalTitle];
    const exists = await behaviorRepo.findOne({
      where: { title: b.title, goal: { id: goal.id } },
      relations: { goal: true },
    });
    if (!exists) {
      await behaviorRepo.save(
        behaviorRepo.create({
          title: b.title,
          difficulty: b.difficulty as Behavior['difficulty'],
          goal,
        }),
      );
    }
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
