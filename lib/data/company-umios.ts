import raw from '@/public/data/companies/umios_v1.json';

/**
 * Umios(구 マルハニチロ) 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅤ, 2026-09).
 *
 * 2026년 3월 1일 상호를 マルハニチロ에서 Umios로 바꿨고 종목코드 1333은 그대로다.
 * 수치는 제82기 有価証券報告書(EDINET S100YCK1)와 決算説明資料, 수산청 통계 원문이다.
 *
 * ⚠ **보고부문으로 참치 비중을 말하지 마라.** 부문 셋(水産資源·食材流通·加工食品) 어디에도
 *   「まぐろ」가 없다. 참치는 어획·양식·유통·가공 넷에 걸쳐 있다.
 * ⚠ **23%와 4%의 분모가 다르다.** 4,300톤은 회사 生産 기준이고 전국 18,687톤은 出荷 기준이다.
 *   나눗셈 전에 기준을 맞춰야 한다.
 * ⚠ **「완전양식이 아직 가장자리」로 쓰지 마라.** 전국 인공종묘 유래 출하는 2020년 2,975톤에서
 *   2024년 405톤으로 **86.4% 줄었다.** 자라는 중이 아니라 무너진 뒤다.
 * ⚠ **「어린 고기를 기른다」가 아니다.** 회사 양식의 대부분은 大型 短期養殖(蓄養)이다.
 * ⚠ **「제재가 없다」로 쓰지 마라.** 2024-03-26 농림수산성이 상장 본체에 식품표시법 指示를
 *   내렸다. 공정취인위원회 명부는 2011년분부터만 있어 그 이전은 알 수 없다.
 * ⚠ **캔 어종을 참다랑어로 좁히지 마라.** 표기는 「まぐろ」까지이고 라이트미트 규격은
 *   흰살(알바코어)을 배제할 뿐이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const umiosMeta = data._meta;
export const umiosCard = data.card;
export const umiosStats = data.stats;
export const umiosSourceNotes = data.sourcenotes;

/** 회사 완전양식 175톤이 전국 인공종묘 유래 출하 405톤에서 차지하는 몫(%). */
export function umiosSeedShareOfNational(): number {
  return Number(((data.stats.완전양식_톤 / data.stats.전국_인공종묘_2024_톤) * 100).toFixed(1));
}

/** 전국 인공종묘 유래 출하의 정점 대비 감소폭(%). 음수다. */
export function nationalSeedCollapsePct(): number {
  const { 전국_인공종묘_정점_톤: peak, 전국_인공종묘_2024_톤: now } = data.stats;
  return Number((((now - peak) / peak) * 100).toFixed(1));
}

/** 회사 양식 참다랑어 가운데 알에서 기른 것의 몫(%). */
export function fullCycleSharePct(): number {
  return Number(((data.stats.완전양식_톤 / data.stats.양식_참다랑어_톤) * 100).toFixed(2));
}
