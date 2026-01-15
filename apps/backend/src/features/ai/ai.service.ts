import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Goal } from '../goal/goal.entity';

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
  constructor(private readonly configService: ConfigService) {}

  async getAIBehaviorTitles(goal: Goal): Promise<string[]> {
    const logger = new Logger();

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

    logger.log(`send Clova API with title:${goal.title} id: ${goal.id}`);

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

    const aiResult = responseJson.result.message.content.replaceAll('`', '').replaceAll('json', '');
    const aiResultObject = JSON.parse(aiResult) as AIBehaviorRecommendation;
    logger.log(`Response of Clova API:: ${aiResult}`);

    return [aiResultObject.몰입하기];
  }
}
