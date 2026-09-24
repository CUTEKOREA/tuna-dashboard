import raw from '@/public/data/companies/pinsa_v1.json';

/**
 * Grupo Pinsa 기업 해부 인테이크 (참치 기업 해부 ⅬⅠ, 2026-09).
 *
 * 멕시코 시날로아주 마사틀란 **Av. Puerto de Mazatlán 406** 의 참치·정어리 그룹.
 * **선망 23척이 멕시코 기국 활성 선망 운반능력의 51,7 % — 기본 캔은 경쟁사와 같은 값, 가장 싼 칸은 이 그룹의 대두 캔.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/pinsa/notes/00_기준선_메인확인.md` N 절 · `build/killed.py`).**
 *
 * 1. **「매대 세 층을 한 그룹이 쥔다」 금지** — PROFECO 100 g 당 평균가(2024-02)에서 기본 캔은 Dolores·Mazatún·Herdez·Tuny 가
 *    모두 $13~14. 그룹 몫은 아래(El Dorado 대두 $9)와 올리브유 라인이고, 올리브유 칸의 맨 위는 Tuny Gourmet($31)다.
 * 2. **점유율은 자칭·Nielsen 인용뿐** — A 등급 분모 없음. 「60 % 이다」 단정 금지, 화자·등급을 붙인다.
 * 3. **「Bours 가문 지배」 금지** — 1차 근거 없는 오보.
 * 4. **「EU 에 캔참치를 가장 많이 파는 멕시코 업체」 금지** — Comext 상 EU 의 멕시코산 1604 는 2023~2025 사실상 0.
 * 5. **EU–멕시코 협정 관세 부분은 iTA** — 회원국 비준 불필요. 캔 7년차·로인 5년차 무관세는 2025 「Without Prejudice」 문안 기준.
 * 6. **NOAA 2026-03-25 돌고래 안전 허위 표시 적발을 Pinsa 제품으로 적지 않는다** — 공급자 비공개.
 * 7. **2026-01-01 MMPA: 멕시코 소형 부어류 선망 정어리류 미국 수입 금지** — 참치 선망은 비교가능성 인정, 「참치 금지」 금지.
 * 8. **MSC 개선 프로그램은 인증이 아니다** — 어업 인증은 2023-03-08 철회. 회사 사이트의 MSC 게시는 자칭.
 * 9. **호텔 단지 자금을 「그룹 돈」으로 단정하지 않는다** — 소유 법인 미확인.
 * 10. **2014 「13 라인·200만 캔」은 회사 대표 설명을 정부가 전달한 것(C)** — 「정부 확인」 금지.
 * 11. **23척은 2023-10 부터** — Azteca 7(전 뉴질랜드 기국 Capt M J Souza) 편입.
 * 12. **무역통계는 나라 단위** — 멕시코 수출·EU 수입을 Pinsa 물량으로 옮기지 않는다. PINSA Congelados 「70 % 수출」(자칭)과 EU 통계를 잇지 않는다.
 * 13. **DOLORES 는 멕시코에서 Productos Dolores(본사 주소) 권리, 파푸아뉴기니 RD 그룹 Dolores 와 다른 권리자** — 「1991 국영에서 샀다」는 보도(B).
 * 14. **개인 실명은 공직자·등기 임원만** — 창업자 회장·DG·지역 인물은 역할로만.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`pinsa stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const pinsaMeta = data._meta;
export const pinsaCard = data.card;
export const pinsaStats = data.stats;
export const pinsaSourceNotes = data.sourcenotes;

/** 선단 — IATTC 활성 선망 등록부 2026-09-24. */
export function fleet() {
  return {
    척수: n('선망_척'), 운반능력: n('운반능력_t'), 멕시코합계: n('멕시코_운반능력_t'),
    몫: n('운반능력_몫_pct'), 동태평양몫: n('동태평양_몫_pct'), 편입: s('Azteca7_편입'),
    MSC철회: s('MSC_철회'), MSC개선: s('MSC_개선프로그램'), MSC목표: s('MSC_본평가목표'),
    DS381: s('DS381_채택'), NOAA: s('NOAA_적발일'), NOAA벌금: n('NOAA_벌금_USD'),
  };
}

/** 매대 — PROFECO 2024-02 네 도시권 평균가, 100 g 당 MXN. */
export function shelf() {
  return {
    대두캔: n('PROFECO_ElDorado_100g'), 기본캔: n('PROFECO_기본캔_100g'),
    DoloresPremium: n('PROFECO_DoloresPremium_100g'), TunyGourmet: n('PROFECO_TunyGourmet_100g'),
    상표: s('상표_DOLORES'), 상표권자: s('상표권자'), 가공장: n('EU승인가공장'),
  };
}

/** 문 — 미국·유럽 (나라 단위). */
export function trade() {
  return {
    수출USD: n('MX_160414_수출_2025_USD'), 수출t: n('MX_160414_수출_2025_t'), 미국몫: n('미국몫_2025_pct'),
    EU냉동황다랑어t: n('EU_030342_2025_t'), EU필레t: n('EU_030487_2025_t'),
    서명: s('iTA_서명'), 유럽의회: s('iTA_유럽의회'), 이사회: s('iTA_이사회'), MMPA: s('MMPA_COA_시행'),
    매출: n('매출_FY2025_mdp'), 직원: n('직원_FY2025'), 조달건: n('조달_PinsaComercial_건'), 조달액: n('조달_PinsaComercial_MXN'),
  };
}
