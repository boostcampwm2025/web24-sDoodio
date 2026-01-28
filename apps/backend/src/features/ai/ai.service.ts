import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DODO_ACTION_VALUES, DODO_ACTIONS, type DodoAction } from '@web24/shared';
import { Goal } from '../goal/goal.entity';
import { DodoChatMessage } from '../chat/dodo-chat-message.entity';

type ClovaChatResponse = {
  status: {
    code: string;
    message: string;
  };
  result: {
    created: number;
    usage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    };
    message: {
      role: 'assistant' | 'user' | 'system';
      content: string;
    };
    seed?: number;
    aiFilter?: Array<{
      groupName: string;
      name: string;
      score: string; // 응답 예시가 string이므로 string
    }>;
  };
};

type AIBehaviorRecommendation = {
  마음열기: string;
  시작하기: string;
  이어가기: string;
  몰입하기: string;
};

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly configService: ConfigService) {}

  async getAIBehaviorTitles(goal: Goal): Promise<string[]> {
    const goalTitle = goal.title;
    const openBehaivors = goal.behaviors
      .filter((b) => b.difficulty === '마음열기')
      .map((b) => b.title);
    const startBehaivors = goal.behaviors
      .filter((b) => b.difficulty === '시작하기')
      .map((b) => b.title);
    const continueBehaivors = goal.behaviors
      .filter((b) => b.difficulty === '이어가기')
      .map((b) => b.title);
    const deepBehaivors = goal.behaviors
      .filter((b) => b.difficulty === '몰입하기')
      .map((b) => b.title);

    const systemPrompt = `최근 사용자가 관심을 가지고 있는 목표는 ${goalTitle}이다.

사용자는 이 목표를 이루기 위한 행동을 4단계로 구분했다.
각 단계의 이름과 정의는 다음과 같다.

1. 마음열기  
- 목표와 직접적인 관련이 없어도 된다.  
- “해볼까?”라는 생각이 떠오르거나, 심리적 저항을 낮추는 행동이면 충분하다.  
- 판단 기준: 목표를 떠올리는 데 부담이 거의 없는가?

2. 시작하기  
- 목표에 다가가기 위한 아주 작은 첫 행동이다.  
- 5~10분 이내에 끝낼 수 있고, 미루기 어려운 행동이 적합하다.  
- 판단 기준: 오늘 당장 해도 부담이 없는가?

3. 이어가기  
- 시작하기를 자주 반복하여 루틴으로 만든 행동이다.  
- 목표 달성에 직접적으로 기여하는 핵심 습관이면 좋다.  
- 판단 기준: 꾸준히 반복할 수 있는가?

4. 몰입하기  
- 항상 해야 할 필요는 없지만, 하면 목표에 크게 가까워지는 행동이다.  
- 끝내고 나면 성취감이나 뿌듯함을 느낄 수 있어야 한다.  
- 판단 기준: 완료 후 “잘했다”는 감정이 드는가?

현재 사용자가 지정한 각 단계별 행동 목록은 다음과 같다.
- 마음열기: ${openBehaivors.join(', ')}
- 시작하기: ${startBehaivors.join(', ')}
- 이어가기: ${continueBehaivors.join(', ')}
- 몰입하기: ${deepBehaivors.join(', ')}


행동 생성 가이드라인
- 위에 제시된 행동과 **의미적으로 중복되지 않아야 함**  
- 각 단계별로 **정확히 1개씩이어야 함**
- 목표를 이루기 위해 도움이 되는 행동이어야 함
- 사용자가 쉽게 생각할 수 있거나 유사한 행동보다는 방향성은 같지만 뜬금 없는 행동이 더 좋음
- 문장부호 금지

출력 형식은 반드시 **유효한 JSON**이어야 하며,
아래 형식을 정확히 지켜야 한다.

{
  "마음열기": "...",
  "시작하기": "...",
  "이어가기": "...",
  "몰입하기": "..."
}

JSON 외의 설명, 문장, 코드블록, 주석은 **절대 출력하지 마**.
`;

    const modelName = 'HCX-005';
    const clovaApiUrl = `https://clovastudio.stream.ntruss.com/v3/chat-completions/${modelName}`;

    const messages = [{ role: 'user', content: [{ type: 'text', text: systemPrompt }] }];

    const body = { messages };

    this.logger.log(`send Clova API with title:${goal.title} id: ${goal.id}`);

    const clovaApiKey = this.configService.getOrThrow<string>('CLOVA_API_KEY');
    const response = await fetch(clovaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clovaApiKey}`,
      },
      body: JSON.stringify(body),
    });

    const responseJson = (await response.json()) as ClovaChatResponse;

    const { content } = responseJson.result.message;
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      this.logger.error(`Failed to find JSON object in Clova API response: ${content}`);
      throw new Error('Failed to parse JSON from Clova API response');
    }

    const jsonStr = content.substring(startIndex, endIndex + 1);

    try {
      const aiResultObject = JSON.parse(jsonStr) as AIBehaviorRecommendation;
      this.logger.log(`Response of Clova API:: ${jsonStr}`);
      return [aiResultObject.몰입하기];
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to parse JSON: ${error.message}`, error.stack, jsonStr);
      } else {
        this.logger.error('Failed to parse JSON: Unknown error', String(error), jsonStr);
      }
      throw new Error('AI 응답 JSON 파싱에 실패했습니다.');
    }
  }

  async createDodoMessage(history: DodoChatMessage[], message: string) {
    const systemPrompt =
      '너는 행동 기록 서비스 "뚜웰"에서 사용자에게 친근하고 따뜻하게 응답하는 캐릭터 "두두"야. ' +
      '반말을 사용하고, 과하지 않은 말투로 짧고 긍정적으로 응답해줘.' +
      '사용자가 힘들어하면 가볍게 응원하고, 너무 길게 설명하지 않아.' +
      "상대방을 지칭할 때에는 '너'라고 표현해줘.";

    const messages = [
      {
        role: 'system' as const,
        content: [{ type: 'text', text: systemPrompt }],
      },
      ...history
        .slice()
        .reverse()
        .map((entry) => ({
          role: entry.role,
          content: [{ type: 'text', text: entry.content }],
        })),
      {
        role: 'user' as const,
        content: [{ type: 'text', text: message }],
      },
    ];

    const modelName = 'HCX-005';
    const clovaApiUrl = `https://clovastudio.stream.ntruss.com/v3/chat-completions/${modelName}`;
    const clovaApiKey = this.configService.getOrThrow<string>('CLOVA_API_KEY');

    const response = await fetch(clovaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clovaApiKey}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      this.logger.error(`CLOVA API error: ${response.status}`);
      throw new ServiceUnavailableException('Failed to fetch CLOVA response');
    }

    const responseJson = (await response.json()) as ClovaChatResponse;
    const reply = responseJson.result.message.content;

    return reply;
  }

  async getDodoAction(message: string): Promise<DodoAction> {
    const systemPrompt = `
      너는 행동 기록 서비스 "뚜웰"의 캐릭터 "두두"가 취할 적절한 행동을 정해야 한다.
      두두는 다음 네가지 행동을 할 수 있다.
      "None", "Sitdown", "Wink", "Hurray"
      반드시 위 네가지 행동 중에 하나만을 응답하고, 그 외의 다른 말은 일체 하지마.
      응답 기준은 질문에 대해서 두두가 취할 답변과 가장 어울리는 행동이야.
      특별히 어울리는 게 없다면 "None"을 출력해.

      ## 예시
      사랑해 -> Wink
      두두 예쁘다 -> Wink
      오늘 할 일 다 했어 -> Hurray
      두두야 다리 안아파? -> Sitdown
      힘드네 좀 쉬고 싶어 -> Sitdown
      심심해 -> None
      점심 먹었어? -> None
    `;

    const messages = [
      {
        role: 'system' as const,
        content: [{ type: 'text', text: systemPrompt }],
      },
      {
        role: 'user' as const,
        content: [{ type: 'text', text: message }],
      },
    ];

    const modelName = 'HCX-005';
    const clovaApiUrl = `https://clovastudio.stream.ntruss.com/v3/chat-completions/${modelName}`;
    const clovaApiKey = this.configService.getOrThrow<string>('CLOVA_API_KEY');

    const response = await fetch(clovaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clovaApiKey}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      this.logger.error(`CLOVA API error: ${response.status}`);
      throw new ServiceUnavailableException('Failed to fetch CLOVA response');
    }

    const responseJson = (await response.json()) as ClovaChatResponse;
    const action = responseJson.result.message.content as DodoAction;

    if (DODO_ACTION_VALUES.includes(action)) return action;
    return DODO_ACTIONS.none;
  }
}
