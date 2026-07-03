import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HERMES_SERVER = process.env.HERMES_SERVER_URL || 'http://localhost:8765';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/v1';
const HERMES_MODEL = process.env.HERMES_MODEL || 'hermes3';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/* ================================================================
 * Hermes Agent API Bridge — 3단계 폴백 아키텍처
 * ================================================================
 * POST /api/hermes — 대시보드에서 Hermes 에이전트에게 질의
 *
 * 모드 1: hermes_agent.py 서버 (Function Calling, 로컬)
 * 모드 2: Ollama 직접 호출 (경량 모드, 로컬)
 * 모드 3: Gemini API (클라우드 폴백, 프로덕션)
 * ================================================================ */

const SYSTEM_PROMPT = `당신은 Silla Co.(신라통상) 소속의 농수산물 무역 전략 분석 AI 어시스턴트 "Hermes"입니다.

역할:
- 사용자가 대시보드 데이터를 해석하고 전략적 인사이트를 도출하도록 돕습니다
- 참치, 새우, 당근, 가금류, 골뱅이, 카사바, 망고스틴 등 농수산물 시세 및 무역 동향을 분석합니다
- 공급망 리스크, 차익거래 기회, 마진율 계산을 제공합니다

핵심 지식:
- 참치: 가다랑어(SKJ) $2,100/MT, 황다랑어(YFT) $2,500/MT, 국내 수입 HS160414 기준 연간 $251M
- 가금류: 태국산 가공육(70°C 가열)이 HPAI SPS 수입금지 회피 가능, 브라질 의존도 60% 리스크
- 새우: 베트남/인도 복수 소싱 권장, EMS 리스크, ASC 인증 프리미엄
- 골뱅이: 중국산 의존도 85%, 칠레/페루 대체 산지 개발 필요
- 당근: IQF 냉동 수입으로 가격 변동 헤지, 국내 자급률 높음
- USD/KRW: ~1,385원

규칙:
- 한국어로 답변하되, 전문 용어는 영문 병기
- 수치에는 단위 표기 필수
- 3~5문장으로 핵심을 간결하게 전달
- 불확실한 정보는 반드시 명시
- 전략적 인사이트와 실행 가능한 제안을 포함`;


// ── 모드 1: Hermes Agent 서버 프록시 ────────────────────────────
async function queryHermesServer(query: string, reset?: boolean): Promise<string | null> {
  try {
    const res = await fetch(`${HERMES_SERVER}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, reset }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.answer || null;
  } catch {
    return null;
  }
}

// ── 모드 2: Ollama 직접 호출 (경량 모드) ────────────────────────
async function queryOllamaDirect(
  query: string,
  context?: string
): Promise<string | null> {
  try {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
    if (context) {
      messages.push({
        role: 'system',
        content: `[대시보드 컨텍스트]\n${context}`,
      });
    }
    messages.push({ role: 'user', content: query });

    const res = await fetch(`${OLLAMA_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: HERMES_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// ── 모드 3: Gemini API 클라우드 폴백 ────────────────────────────
async function queryGeminiCloud(
  query: string,
  context?: string
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const systemInstruction = context
      ? `${SYSTEM_PROMPT}\n\n[대시보드 컨텍스트]\n${context}`
      : SYSTEM_PROMPT;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: query }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}


// ── 헬스 체크 ──────────────────────────────────────────────────
async function checkHermesServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${HERMES_SERVER}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkOllamaHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${OLLAMA_URL.replace('/v1', '')}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return r.ok;
  } catch {
    return false;
  }
}


// ── POST Handler ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, context, reset } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '질의(query)가 필요합니다.' },
        { status: 400 }
      );
    }

    let answer: string | null = null;
    let mode = 'unknown';

    // 1순위: Hermes Agent 서버 (Function Calling 지원)
    const serverAlive = await checkHermesServerHealth();
    if (serverAlive) {
      answer = await queryHermesServer(query, reset);
      mode = 'hermes-server';
    }

    // 2순위: Ollama 직접 호출 (경량 모드)
    if (!answer) {
      answer = await queryOllamaDirect(query, context);
      if (answer) mode = 'ollama-direct';
    }

    // 3순위: Gemini API 클라우드 폴백 (프로덕션)
    if (!answer) {
      answer = await queryGeminiCloud(query, context);
      if (answer) mode = 'gemini-cloud';
    }

    if (!answer) {
      return NextResponse.json(
        {
          error: 'AI 서버에 연결할 수 없습니다.',
          hint: 'Gemini API 키가 설정되지 않았습니다. Vercel 환경변수에 GEMINI_API_KEY를 추가해주세요.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      answer,
      mode,
      model: mode === 'gemini-cloud' ? 'gemini-2.5-flash' : HERMES_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '요청 처리 중 오류 발생', detail: err.message },
      { status: 500 }
    );
  }
}

// ── GET Handler (상태 확인) ────────────────────────────────────
export async function GET() {
  const [hermesUp, ollamaUp] = await Promise.all([
    checkHermesServerHealth(),
    checkOllamaHealth(),
  ]);

  const geminiAvailable = !!GEMINI_API_KEY;
  const anyAvailable = hermesUp || ollamaUp || geminiAvailable;

  return NextResponse.json({
    status: anyAvailable ? 'operational' : 'offline',
    hermes_server: hermesUp ? '🟢 LIVE' : '🔴 Offline',
    ollama_server: ollamaUp ? '🟢 LIVE' : '🔴 Offline',
    gemini_cloud: geminiAvailable ? '🟢 Available' : '🔴 No API Key',
    model: HERMES_MODEL,
    endpoints: {
      hermes: HERMES_SERVER,
      ollama: OLLAMA_URL,
      gemini: geminiAvailable ? 'generativelanguage.googleapis.com' : 'not configured',
    },
  });
}
