import type { GoalColor } from '@web24/shared';
import { useEffect, useState } from 'react';
import { NewGoalFrame, type NewGoalFrameStep } from '@/features/goal/components/NewGoalFrame';
import { DODO_LINES } from '@/features/goal/constants/dodo';
import { useGoalTemplates } from '@/features/goal/hooks/useGoalTemplates';
import { TemplateSelection } from '@/features/goal/components/TemplateSelection';
import { BehaviorSelection, type BehaviorItem } from '@/features/goal/components/BehaviorSelection';
import { NewGoal } from '@/features/goal/components/NewGoal';

export function NewGoalPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const customTemplateId = 'custom-template';
  const { templates } = useGoalTemplates();
  const [newGoalColor, setNewGoalColor] = useState<GoalColor>('light-pink');
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');

  const [openBehaviors, setOpenBehaviors] = useState<BehaviorItem[]>([]);
  const [startBehaviors, setStartBehaviors] = useState<BehaviorItem[]>([]);
  const [continueBehaviors, setContinueBehaviors] = useState<BehaviorItem[]>([]);
  const [deepBehaviors, setDeepBehaviors] = useState<BehaviorItem[]>([]);

  useEffect(() => {
    if (currentStepIndex === 0 && newGoalTitle.length !== 0) {
      setSelectedTemplateId(null);
      setNewGoalColor('light-pink');
      setNewGoalTitle('');
      setOpenBehaviors([]);
      setStartBehaviors([]);
      setContinueBehaviors([]);
      setDeepBehaviors([]);
    }
  }, [
    templates,
    currentStepIndex,
    openBehaviors.length,
    selectedTemplateId,
    startBehaviors.length,
    continueBehaviors.length,
    deepBehaviors.length,
    newGoalTitle.length,
  ]);

  const newGoalFrameSteps: NewGoalFrameStep[] = [
    {
      step: 1,
      headerText: '',
      unskippable: true,
      dialogue: DODO_LINES.select.at(0) ?? '',
      content: (
        <TemplateSelection
          selectedTemplateId={selectedTemplateId}
          customTemplateId={customTemplateId}
          templates={templates}
          onSelect={(templateId) => {
            const templateIdx = templates.findIndex((template) => template.id === templateId);
            setSelectedTemplateId(templateId);
            const selectedTemplate = templateIdx === -1 ? null : templates.at(templateIdx);
            setOpenBehaviors(
              (selectedTemplate?.level.마음열기 ?? []).map((title) => ({
                id: crypto.randomUUID(),
                title,
              })),
            );
            setStartBehaviors(
              (selectedTemplate?.level.시작하기 ?? []).map((title) => ({
                id: crypto.randomUUID(),
                title,
              })),
            );
            setContinueBehaviors(
              (selectedTemplate?.level.이어가기 ?? []).map((title) => ({
                id: crypto.randomUUID(),
                title,
              })),
            );
            setDeepBehaviors(
              (selectedTemplate?.level.몰입하기 ?? []).map((title) => ({
                id: crypto.randomUUID(),
                title,
              })),
            );
          }}
        />
      ),
    },
    {
      step: 2,
      headerText: '목표 작성',
      dialogue: DODO_LINES.goal.join('\n'),
      content: (
        <NewGoal
          title={newGoalTitle}
          setTitle={(title) => setNewGoalTitle(title)}
          color={newGoalColor}
          setColor={(color) => setNewGoalColor(color)}
        />
      ),
    },
    {
      step: 3,
      headerText: '마음열기',
      unskippable: true,
      dialogue: DODO_LINES.open.at(0) ?? '',
      content: (
        <BehaviorSelection
          behaviors={openBehaviors}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setOpenBehaviors(
              openBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={() => {
            setOpenBehaviors([...openBehaviors, { id: crypto.randomUUID(), title: '' }]);
          }}
          onDelete={(targetId) => {
            setOpenBehaviors(openBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
    },
    {
      step: 4,
      headerText: '시작하기',
      unskippable: true,
      dialogue: DODO_LINES.start.at(0) ?? '',
      content: (
        <BehaviorSelection
          behaviors={startBehaviors}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setStartBehaviors(
              startBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={() => {
            setStartBehaviors([...startBehaviors, { id: crypto.randomUUID(), title: '' }]);
          }}
          onDelete={(targetId) => {
            setStartBehaviors(startBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
    },
    {
      step: 5,
      headerText: '이어가기',
      unskippable: true,
      dialogue: DODO_LINES.continue.at(0) ?? '',
      content: (
        <BehaviorSelection
          behaviors={continueBehaviors}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setContinueBehaviors(
              continueBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={() => {
            setContinueBehaviors([...continueBehaviors, { id: crypto.randomUUID(), title: '' }]);
          }}
          onDelete={(targetId) => {
            setContinueBehaviors(continueBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
    },
    {
      step: 6,
      headerText: '몰입하기',
      unskippable: true,
      dialogue: DODO_LINES.start.at(0) ?? '',
      content: (
        <BehaviorSelection
          behaviors={deepBehaviors}
          onChangeBehaviorTitle={(targetId, newTitle) => {
            setDeepBehaviors(
              deepBehaviors.map((item) =>
                item.id === targetId ? { ...item, title: newTitle } : item,
              ),
            );
          }}
          onAdd={() => {
            setDeepBehaviors([...deepBehaviors, { id: crypto.randomUUID(), title: '' }]);
          }}
          onDelete={(targetId) => {
            setDeepBehaviors(deepBehaviors.filter((item) => item.id !== targetId));
          }}
        />
      ),
    },
  ];

  const handleSkip = () => {};

  const handleComplete = () => {};

  return (
    <NewGoalFrame
      currStepIdx={currentStepIndex}
      steps={newGoalFrameSteps}
      progressSteps={[2, 3, 4, 5]}
      onMove={(targetIdx) => setCurrentStepIndex(targetIdx)}
      onSkip={handleSkip}
      onComplete={handleComplete}
    />
  );
}
