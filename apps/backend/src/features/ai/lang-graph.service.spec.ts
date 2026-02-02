import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DODO_ACTIONS } from '@web24/shared';
import { LangGraphService } from './lang-graph.service';
import { TodayBehavior } from '../behavior/today-behavior.entity';
import { Goal } from '../goal/goal.entity';

describe('LangGraphService', () => {
  let service: LangGraphService;
  const todayBehaviorRepository = { find: jest.fn() };
  const goalRepository = { find: jest.fn() };

  beforeEach(async () => {
    todayBehaviorRepository.find.mockReset();
    goalRepository.find.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangGraphService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-key') },
        },
        {
          provide: getRepositoryToken(TodayBehavior),
          useValue: todayBehaviorRepository,
        },
        {
          provide: getRepositoryToken(Goal),
          useValue: goalRepository,
        },
      ],
    }).compile();

    service = module.get<LangGraphService>(LangGraphService);
  });

  const baseState = (overrides: Partial<any> = {}) => ({
    userId: '019c0800-772d-772d-97fb-7cedeadc0301',
    messages: [],
    userInput: '내 목표가 뭐야?',
    dodoAction: undefined,
    dodoReply: undefined,
    toolPlan: undefined,
    toolPlanRaw: undefined,
    toolPlanValid: undefined,
    toolResults: undefined,
    toolValidationFailures: 0,
    final: undefined,
    llmCalls: 0,
    ...overrides,
  });

  describe('invokeDodoAgent', () => {
    it('도구가 필요 없으면 dodoChatLlm -> dodoActionLlm 경로로 응답한다', async () => {
      const callClovaSpy = jest
        .spyOn(service as any, 'callClova')
        .mockResolvedValueOnce(JSON.stringify({ tools: [] }))
        .mockResolvedValueOnce('반가워!')
        .mockResolvedValueOnce(DODO_ACTIONS.wink)
        .mockResolvedValue(DODO_ACTIONS.none);

      const result = await service.invokeDodoAgent(baseState());

      expect(result).toEqual({ reply: '반가워!', action: DODO_ACTIONS.wink });
      expect(callClovaSpy).toHaveBeenCalledTimes(3);
    });

    it('도구가 필요하면 executeToolsNode 후 dodoToolChatLlm으로 응답한다', async () => {
      goalRepository.find.mockResolvedValue([{ id: 'g1', title: '운동' }]);
      const callClovaSpy = jest
        .spyOn(service as any, 'callClova')
        .mockResolvedValueOnce(JSON.stringify({ tools: ['fetchGoals'] }))
        .mockResolvedValueOnce('목표는 운동이야')
        .mockResolvedValue(JSON.stringify({ tools: [] }));

      const result = await service.invokeDodoAgent(baseState());

      expect(result).toEqual({ reply: '목표는 운동이야', action: DODO_ACTIONS.none });
      expect(callClovaSpy).toHaveBeenCalledTimes(2);
    });

    it('도구 계획 파싱이 2회 실패하면 dodoFailedChatLlm으로 응답한다', async () => {
      const callClovaSpy = jest
        .spyOn(service as any, 'callClova')
        .mockResolvedValueOnce('not-json')
        .mockResolvedValueOnce('still-not-json')
        .mockResolvedValueOnce('실패 응답');

      const result = await service.invokeDodoAgent(baseState());

      expect(result).toEqual({ reply: '실패 응답', action: DODO_ACTIONS.none });
      expect(callClovaSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('validateToolPlanNode', () => {
    it('유효한 JSON이면 toolPlan을 정규화한다', async () => {
      const node = (service as any).validateToolPlanNode;
      const state = baseState({
        toolPlanRaw: JSON.stringify({ tools: ['fetchGoals', 'unknown'] }),
      });

      const result = await node(state, {} as any);

      expect(result.toolPlanValid).toBe(true);
      expect(result.toolPlan).toEqual(['fetchGoals']);
    });

    it('JSON 파싱 실패 시 toolPlanValid=false를 반환한다', async () => {
      const node = (service as any).validateToolPlanNode;
      const state = baseState({ toolPlanRaw: 'not-json' });

      const result = await node(state, {} as any);

      expect(result.toolPlanValid).toBe(false);
    });

    it('알 수 없는 도구는 제거한다', async () => {
      const node = (service as any).validateToolPlanNode;
      const state = baseState({
        toolPlanRaw: JSON.stringify({ tools: ['fetchGoals', 'unknown'] }),
      });

      const result = await node(state, {} as any);

      expect(result.toolPlan).toEqual(['fetchGoals']);
    });
  });

  describe('executeToolsNode', () => {
    it('도구 결과를 병합한다', async () => {
      todayBehaviorRepository.find.mockResolvedValue([
        {
          id: 'tb1',
          status: 'completed',
          behavior: { title: '자전거 타기', difficulty: '시작하기', goal: { title: '운동' } },
        },
      ]);
      goalRepository.find.mockResolvedValue([{ id: 'g1', title: '운동' }]);

      const node = (service as any).executeToolsNode;
      const state = baseState({ toolPlan: ['fetchTodayBehaviors', 'fetchGoals'] });

      const result = await node(state, {} as any);

      expect(result.toolResults.fetchTodayBehaviors).toHaveLength(1);
      expect(result.toolResults.fetchGoals).toHaveLength(1);
    });
  });

  describe('dodoChatLlmCallNode', () => {
    it('toolResults가 있으면 시스템 프롬프트에 포함한다', async () => {
      const callClovaSpy = jest.spyOn(service as any, 'callClova').mockResolvedValue('ok');

      const node = (service as any).dodoChatLlmCallNode;
      const state = baseState({
        toolResults: { fetchGoals: [{ id: 'g1', title: '운동' }] },
      });

      await node(state, {} as any);

      const [[messages]] = callClovaSpy.mock.calls as [[Array<{ content: string }>]];
      const systemMessage = messages[0];
      expect(systemMessage.content).toContain('fetchGoals');
    });
  });
});
