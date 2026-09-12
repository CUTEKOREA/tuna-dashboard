import raw from '@/public/data/companies/garavilla_v1.json';

/**
 * Conservas Garavilla 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩⅤ, 2026-09).
 *
 * 브랜드 Isabel. 자릿수까지 읽히는 거점은 통합환경허가를 가진 오 그로베 하나뿐이다.
 *
 * ⚠ **「Conservas Garavilla S.A.가 S.L.U.로 바뀌었다」 금지.** 법인격은 교체됐고(2012 흡수합병·소멸)
 *    포괄승계라 사업이 끊기지 않았을 뿐이다.
 * ⚠ **「1887년 설립한 회사」 금지.** 브랜드·가업의 기원이고 현행 법인은 2010년 설립이다.
 * ⚠ **「베르메오 공장」 현재형 금지.** 2002년 폐쇄이고 바스크 생산은 문다카에서 2012년에 끝났다.
 *    현행 베르메오 통합환경허가는 Sálica 것이다.
 * ⚠ **「참치 라인 5개 그대로」 금지.** 참치를 다루던 라인은 13 → 5로 줄었고 **참치 인가 능력만**
 *    3,910,568 상자로 같다.
 * ⚠ **「분당 665캔」·「가동률 32.06%」를 현재형으로 쓰지 마라.** 둘 다 2025년에 폐지된 홍합 라인 값이다.
 * ⚠ **「스페인 점유율 45%」 금지.** 제조사 브랜드만의 2014년 구간값([40-50]%)이다.
 * ⚠ **「자체상표 76%」에 연도를 안 붙이는 것 금지.** 2015년 값이고 2024년은 78.4% 이상이다.
 * ⚠ **「2025년에 소유가 넘어갔다」 금지.** 단독주주 선언 등기일이지 지분 이전일이 아니다.
 * ⚠ **「2025년에 합병했다」 금지.** 합병 공고가 스페인·프랑스 어느 관보에도 0건이다 — 본점 이전·상표
 *    이전·단독주주 선언·이사회 교체가 한 해에 겹친 3중 집중이지 합병이 아니다.
 * ⚠ **「상표는 지주가 갖고 있다」 금지.** 2025-05-06 EUIPO recordal #027530941 이후 ISABEL·CUCA·
 *    CUCA MAR Y AMOR·MASSÓ는 Bolton Food S.p.A. 것이고 지주에는 도형상표와 스페인 구 등록만 남았다.
 * ⚠ **만타·아가디르 칸에 오 그로베의 라인·속도·면적을 옮기지 마라.**
 * ⚠ **「제재 0건」 금지.** «Conserveras» 사건(S/0181/09) 피심인이었고 과징금 10만 €는 협회 ANFACO에만
 *    부과됐다 — 두 사실을 함께 적어야 참이 된다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — `상표이전_2025`·`사업회사_설립일`은 날짜 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`garavilla stats.${key} 가 숫자가 아니다`);
  return v;
}

export const garavillaMeta = data._meta;
export const garavillaCard = data.card;
export const garavillaStats = data.stats;
export const garavillaSourceNotes = data.sourcenotes;

/**
 * 선망 4척이 공장 넷보다 몇 배를 태우는가(2022년 에너지, GJ).
 *
 * 반올림하지 않고 **절사**한다 — 2.39518…을 2.40으로 올리면 「2.4배」라는 없는 자리가 생긴다.
 */
export function fleetEnergyRatio(): number {
  const plants = n('에너지_스페인_2022_GJ') + n('에너지_에콰도르_2022_GJ') + n('에너지_모로코_2022_GJ');
  return Math.floor((n('에너지_선단_2022_GJ') / plants) * 100) / 100;
}

/**
 * 오 그로베 인가 캔상자의 2024 → 2025 이동.
 *
 * 라인이 15 → 9로 줄었는데 인가 상자는 늘었다. 「라인이 줄어 능력이 줄었다」로 읽으면 거꾸로다.
 */
export function authorizedCasesShift(): { 2024: number; 2025: number; 증가율: number } {
  const a = n('인가_캔상자_2024');
  const b = n('인가_캔상자_2025');
  return { 2024: a, 2025: b, 증가율: Number((((b - a) / a) * 100).toFixed(1)) };
}
