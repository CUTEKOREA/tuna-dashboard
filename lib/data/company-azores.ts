import raw from '@/public/data/companies/azores_v1.json';

/**
 * 아소르스의 다섯 캔공장 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅬ, 2026-09).
 *
 * 포르투갈 아소르스의 참치 캔 공장 다섯 — COFACO Açores · Santa Catarina(SCA 운영) ·
 * Pescatum · Sociedade Corretora · Conseran — 과 본토 대조군 Ramirez.
 * 다섯은 같은 최외곽지역 추가비용 보전금을 받고, 그 지급 명부가 원어를 역내산·공동체산
 * 두 코드로 갈라 적는다. 섬 물고기 비중이 100 %부터 8.72 %까지 갈리고 가장 낮은 곳이
 * 가장 큰 공장이다.
 *
 * ⚠ **「원어의 X % 를 수입한다」 금지** — 비중은 보전 **금액** 비중이지 물량 비중이 아니고,
 *    공동체산은 마데이라 배·다른 회원국 배가 잡은 것이라 「수입」과 같은 말도 아니다.
 * ⚠ **「섬 물고기로 채우지 못했다」 금지** — 제12조 제5항의 상한 7,500톤은 공장별이 아니라
 *    아소르스 전체의 한도다. 조건은 해마다 충족돼 왔고 공장을 가르지 않는다.
 * ⚠ **「그해 바다가 비중을 정한다」 금지** — 가다랑어가 가장 많던 2021년에 비중이 가장 낮았다.
 *    바다인지 조달인지 원장으로는 가를 수 없다.
 * ⚠ **「가다랑어는 아소르스에서만」 금지** — 마데이라도 같은 여섯 해 4,410톤을 올렸다.
 * ⚠ **「2024년 공장 앞 가다랑어가 사라졌다」 금지** — 2024년 이후 1차판매 원장은 항구 코드가
 *    다시 매겨져 배분이 오염돼 있다(코르부섬 새조개 1,719톤). 합은 맞고 배분이 틀렸다.
 * ⚠ **2024년 역내산 톤수는 처리 능력이 아니다** — 신청액 ÷ 171 €/t 로 되돌린 보전 대상 톤수다.
 * ⚠ **「제도가 설비 공개를 갈랐다」 금지** — 반대 사례 둘이 공개를 가른 것은 보도량이라고 보인다.
 * ⚠ **「Friend of the Sea 현행 인증」 금지** — 확인되는 것은 2021년판 고객명부다.
 *    그리고 없는 것은 MSC 하나라, 인증 일반이 없다고 뭉치지 않는다.
 * ⚠ 캔 문구는 「TRADIÇÃO AÇORES」다. 「Santa Maria 섬 공장」은 없다 — 다섯은 상미겔·상조르즈·
 *    테르세이라·피쿠 네 섬에 있다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — 승인번호·날짜는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`azores stats.${key} 가 숫자가 아니다`);
  return v;
}

export const azoresMeta = data._meta;
export const azoresCard = data.card;
export const azoresStats = data.stats;
export const azoresSourceNotes = data.sourcenotes;

/**
 * 같은 보전금 명부 위의 다섯 — 역내산 비중(승인액, 2021~2024 합)과 네 해 신청액.
 *
 * ⚠ 비중은 **금액** 비중이다. 공동체산 단가가 2.22배라 공동체산 쪽 산식이 같다면
 *    물량 비중은 이보다 높다. 물량 비중으로 옮겨 적지 않는다.
 */
export function regionalSpectrum(): {
  공장: { 이름: string; 약칭: string; 섬: string; 비중_pct: number; 신청액_EUR: number }[];
  최대_신청: { 이름: string; 신청액_EUR: number; 나머지넷_EUR: number };
  단서: string;
} {
  return {
    공장: [
      { 이름: 'Sociedade Corretora', 약칭: 'Corretora', 섬: 'São Miguel · Vila Franca do Campo', 비중_pct: n('역내산_비중_승인액_Corretora_pct'), 신청액_EUR: n('4년_신청액_Corretora_EUR') },
      { 이름: 'Conseran', 약칭: 'Conseran', 섬: 'Pico · Madalena', 비중_pct: n('역내산_비중_승인액_Conseran_pct'), 신청액_EUR: n('4년_신청액_Conseran_EUR') },
      { 이름: 'Santa Catarina(SCA 운영)', 약칭: 'Santa Catarina', 섬: 'São Jorge · Calheta', 비중_pct: n('역내산_비중_승인액_SantaCatarina_pct'), 신청액_EUR: n('4년_신청액_SantaCatarina_EUR') },
      { 이름: 'Pescatum', 약칭: 'Pescatum', 섬: 'Terceira · Cabo da Praia', 비중_pct: n('역내산_비중_승인액_Pescatum_pct'), 신청액_EUR: n('4년_신청액_Pescatum_EUR') },
      { 이름: 'COFACO Açores', 약칭: 'COFACO', 섬: 'São Miguel · Rabo de Peixe', 비중_pct: n('역내산_비중_승인액_COFACO_pct'), 신청액_EUR: n('4년_신청액_COFACO_EUR') },
    ],
    최대_신청: {
      이름: 'COFACO Açores',
      신청액_EUR: n('4년_신청액_COFACO_EUR'),
      나머지넷_EUR: n('4년_신청액_나머지넷_EUR'),
    },
    단서: '비중은 승인·지급액 기준이고 신청액은 신청액이다 — 두 열을 섞어 나누면 수가 달라진다',
  };
}

/**
 * 2024년 공장별 역내산 — 신청액을 단가 171 €/t 로 되돌린 톤수.
 *
 * ⚠ **처리 능력이 아니다.** 보전 대상으로 신청한 역내산 톤수다. 합이 그해 한도 훈령과
 *    kg 단위까지 같아서 산식이 닫힌다는 것이 확인될 뿐, 공장이 캔에 넣은 총량은 아니다.
 * ⚠ 공동체산은 같은 방식으로 한도가 되살아나지 않아 톤으로 바꾸지 않는다.
 */
export function regionalTonnes2024(): {
  SCA_t: number; Conseran_t: number; Corretora_t: number; Pescatum_t: number; COFACO_t: number;
  합_t: number; 한도_kg: number; 단가_EUR_t: number;
  단서: string;
} {
  return {
    SCA_t: n('역내산_2024_SCA_t'),
    Conseran_t: n('역내산_2024_Conseran_t'),
    Corretora_t: n('역내산_2024_Corretora_t'),
    Pescatum_t: n('역내산_2024_Pescatum_t'),
    COFACO_t: n('역내산_2024_COFACO_t'),
    합_t: n('역내산_2024_합_t'),
    한도_kg: n('한도_2024_역내산_kg'),
    단가_EUR_t: n('단가_역내산_EUR_t'),
    단서: '보전 대상으로 신청한 역내산 톤수이지 처리 능력이 아니다',
  };
}
