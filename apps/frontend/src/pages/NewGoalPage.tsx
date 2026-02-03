import {
  BEHAVIOR_DIFFICULTIES,
  type BehaviorDifficulty,
  type GoalColor,
  type GoalTemplate,
} from '@web24/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewGoalFrame, type NewGoalFrameStep } from '@/features/goal/components/NewGoalFrame';
import { DODO_LINES } from '@/features/goal/constants/dodo';
import { useGoalTemplates } from '@/features/goal/hooks/useGoalTemplates';
import { TemplateSelection } from '@/features/goal/components/TemplateSelection';
import { BehaviorSelection, type BehaviorItem } from '@/features/goal/components/BehaviorSelection';
import { NewGoal } from '@/features/goal/components/NewGoal';
import { createGoal } from '@/features/goal/apis/createGoal.api';
import { v7 } from 'uuid';
import { SummaryView } from '@/features/goal/components/SummaryView';
import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { DomainError } from '@/shared/errors/domain-error';

export function NewGoalPage() {
  const navigate = useNavigate();
  const showToast = useDodoToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const customTemplateId = 'custom-template';
  const { templates } = useGoalTemplates();
  const [newGoalColor, setNewGoalColor] = useState<GoalColor>('light-pink');
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');

  const [openBehaviors, setOpenBehaviors] = useState<BehaviorItem[]>([]);
  const [startBehaviors, setStartBehaviors] = useState<BehaviorItem[]>([]);
  const [continueBehaviors, setContinueBehaviors] = useState<BehaviorItem[]>([]);
  const [deepBehaviors, setDeepBehaviors] = useState<BehaviorItem[]>([]);

  const behaviorsMap = {
    [BEHAVIOR_DIFFICULTIES[0]]: openBehaviors,
    [BEHAVIOR_DIFFICULTIES[1]]: startBehaviors,
    [BEHAVIOR_DIFFICULTIES[2]]: continueBehaviors,
    [BEHAVIOR_DIFFICULTIES[3]]: deepBehaviors,
  };

  const newGoalFrameSteps: NewGoalFrameStep[] = [
    {
      step: 1,
      headerText: '',
      unskippable: true,
      dialogue: DODO_LINES.select,
      content: (
        <TemplateSelection
          selectedTemplateId={selectedTemplateId}
          customTemplateId={customTemplateId}
          templates={templates}
          onSelect={(templateId) => {
            const template = templates.find((t) => t.id === templateId);
            setSelectedTemplateId(templateId);
            setSelectedTemplate(template ?? null);
            setNewGoalTitle(template?.title ?? '');
            setOpenBehaviors([]);
            setStartBehaviors([]);
            setContinueBehaviors([]);
            setDeepBehaviors([]);
          }}
        />
      ),
      validate: () => {
        if (!selectedTemplateId) {
          showToast('아무 것도 선택되지 않았어!', { position: 'top' });
          return false;
        }
        return true;
      },
    },
    {
      step: 2,
      headerText: '목표 작성',
      dialogue: DODO_LINES.goal,
      content: (
        <NewGoal
          title={newGoalTitle}
          setTitle={(title) => setNewGoalTitle(title)}
          color={newGoalColor}
          setColor={(color) => setNewGoalColor(color)}
        />
      ),
      validate: () => {
        if (newGoalTitle.trim().length === 0) {
          showToast('목표 이름이 비어있어!', { position: 'top' });
          return false;
        }
        return true;
      },
    },
    {
      step: 3,
      headerText: BEHAVIOR_DIFFICULTIES[0],
      dialogue: DODO_LINES.open,
      content: (
        <BehaviorSelection
          behaviors={openBehaviors}
          recommendations={selectedTemplate?.level.마음열기 ?? []}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setOpenBehaviors(
              openBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={(title?: string) => {
            setOpenBehaviors([...openBehaviors, { id: v7(), title: title ?? '' }]);
          }}
          onDelete={(targetId) => {
            setOpenBehaviors(openBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
      validate: () => {
        const cleaned = openBehaviors.filter((b) => b.title.trim().length > 0);

        if (cleaned.length === 0) {
          showToast(`${BEHAVIOR_DIFFICULTIES[0]} 행동을 하나 이상 입력해줘!`, { position: 'top' });
          return false;
        }

        setOpenBehaviors(cleaned);
        return true;
      },
    },
    {
      step: 4,
      headerText: BEHAVIOR_DIFFICULTIES[1],
      dialogue: DODO_LINES.start,
      content: (
        <BehaviorSelection
          behaviors={startBehaviors}
          recommendations={selectedTemplate?.level.시작하기 ?? []}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setStartBehaviors(
              startBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={(title?: string) => {
            setStartBehaviors([...startBehaviors, { id: v7(), title: title ?? '' }]);
          }}
          onDelete={(targetId) => {
            setStartBehaviors(startBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
      validate: () => {
        const cleaned = startBehaviors.filter((b) => b.title.trim().length > 0);

        if (cleaned.length === 0) {
          showToast(`${BEHAVIOR_DIFFICULTIES[1]} 행동을 하나 이상 입력해줘!`, { position: 'top' });
          return false;
        }

        setStartBehaviors(cleaned);
        return true;
      },
    },
    {
      step: 5,
      headerText: BEHAVIOR_DIFFICULTIES[2],
      dialogue: DODO_LINES.continue,
      content: (
        <BehaviorSelection
          behaviors={continueBehaviors}
          recommendations={selectedTemplate?.level.이어가기 ?? []}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setContinueBehaviors(
              continueBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={(title?: string) => {
            setContinueBehaviors([...continueBehaviors, { id: v7(), title: title ?? '' }]);
          }}
          onDelete={(targetId) => {
            setContinueBehaviors(continueBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
      validate: () => {
        const cleaned = continueBehaviors.filter((b) => b.title.trim().length > 0);

        if (cleaned.length === 0) {
          showToast(`${BEHAVIOR_DIFFICULTIES[2]} 행동을 하나 이상 입력해줘!`, { position: 'top' });
          return false;
        }

        setContinueBehaviors(cleaned);
        return true;
      },
    },
    {
      step: 6,
      headerText: BEHAVIOR_DIFFICULTIES[3],
      dialogue: DODO_LINES.deep,
      content: (
        <BehaviorSelection
          behaviors={deepBehaviors}
          recommendations={selectedTemplate?.level.몰입하기 ?? []}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setDeepBehaviors(
              deepBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={(title?: string) => {
            setDeepBehaviors([...deepBehaviors, { id: v7(), title: title ?? '' }]);
          }}
          onDelete={(targetId) => {
            setDeepBehaviors(deepBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
      validate: () => {
        const cleaned = deepBehaviors.filter((b) => b.title.trim().length > 0);

        if (cleaned.length === 0) {
          showToast(`${BEHAVIOR_DIFFICULTIES[3]} 행동을 하나 이상 입력해줘!`, { position: 'top' });
          return false;
        }

        setDeepBehaviors(cleaned);
        return true;
      },
    },
    {
      step: 7,
      headerText: '최종 확인',
      unskippable: true,
      dialogue: DODO_LINES.summary,
      content: (
        <SummaryView
          goalTitle={newGoalTitle}
          goalColor={newGoalColor}
          behaviorsMap={behaviorsMap}
          onEditStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
        />
      ),
    },
  ];

  const handleSkip = () => {
    setCurrentStepIndex(newGoalFrameSteps.length - 1);
  };

  const handleComplete = async () => {
    const buildBehaviors = (difficulty: BehaviorDifficulty, behaviors: BehaviorItem[]) =>
      behaviors
        .map((behavior) => ({
          title: behavior.title.trim(),
          difficulty,
        }))
        .filter((behavior) => behavior.title.length > 0);

    const behaviors = [
      ...buildBehaviors(BEHAVIOR_DIFFICULTIES[0], openBehaviors),
      ...buildBehaviors(BEHAVIOR_DIFFICULTIES[1], startBehaviors),
      ...buildBehaviors(BEHAVIOR_DIFFICULTIES[2], continueBehaviors),
      ...buildBehaviors(BEHAVIOR_DIFFICULTIES[3], deepBehaviors),
    ];

    try {
      await createGoal({
        goalTitle: newGoalTitle.trim(),
        goalColor: newGoalColor,
        templateId:
          selectedTemplateId === customTemplateId ? undefined : (selectedTemplateId ?? undefined),
        behaviors,
      });
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof DomainError) {
        showToast(error.message, { position: 'top' });
      } else {
        showToast('알 수 없는 문제가 생겼네.');
      }
    }
  };

  return (
    <NewGoalFrame
      currStepIdx={currentStepIndex}
      steps={newGoalFrameSteps}
      progressSteps={[2, 3, 4, 5, 6, 7]}
      onMove={(targetIdx) => setCurrentStepIndex(targetIdx)}
      onSkip={handleSkip}
      onComplete={() => {
        if (currentStepIndex === newGoalFrameSteps.length - 1) handleComplete();
        else setCurrentStepIndex((prev) => prev + 1);
      }}
    />
  );
}
