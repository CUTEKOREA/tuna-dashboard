import raw from '@/public/data/companies/pataya_v1.json';

/**
 * Pataya Food Industries 기업 해부 인테이크 (참치 기업 해부 ⅬⅩⅠ, 2026-09).
 *
 * 방콕 본점 비공개 유한회사(DBD 0105522010087, 1979-05-17). 사뭇사콘 마하차이 90/6 한 단지 + 베트남 껀터 별도 법인.
 * **2026-09-01 등록자본 증가(증가분 = 증자 뒤 자본의 25,10 %) → 09-10 PFG 「decided to invest」 → 09-14 Umios 「決定」.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/pataya/notes/00_기준선_동결_집필용.md` N+·N++·O 절 · `build/killed.py`).**
 *
 * 1. **「신주 25,1 %」·「Umios가 샀다」 단정 금지** — 등기는 등록자본 증가만 보여 준다. 인수 경로 문서 없음.
 * 2. **「Kingfisher 12,60 %」·「일본인 이사」 금지** — 국적표는 일본 국적 1곳 12,50 %, 이사는 「일본식 이름」.
 * 3. **「참치 회사」·「PFI 매출의 32 %」 금지** — 32 %는 PFG 그룹 매출에 대한 경영진 발언.
 * 4. **「그룹 매출 감소」 금지** — 2025 「70억 밧 이상」은 하한.
 * 5. **「태국 공장 3곳」·「360 t/일 능력」 금지** — DIW 식품 가공 허가 1건, 360은 IEc 추정.
 * 6. **「Nautilus 1위·2위·35,8 %」 금지** — 분모가 있는 점유율은 Sealect(TU 연차보고서)뿐.
 * 7. **「Bumble Bee 최대 공급자」 금지** — 선하증권 건수 1위, DB마다 다르다. 「한국에 수출한 적 없다」 금지.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`pataya stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const patayaMeta = data._meta;
export const patayaCard = data.card;
export const patayaStats = data.stats;
export const patayaSourceNotes = data.sourcenotes;

/** 등기 — DBD 자본 이력·국적표·이사 명단, Umios 발표. */
export function registry() {
  return {
    자본전: n('자본_전'), 자본후: n('자본_후'), 증가몫: n('증가몫'), 일본몫: n('일본몫'),
    이사: n('이사'), 일본식이사: n('일본식이사'), KF지분: n('KF지분'),
  };
}

/** 장부 — DBD 요약(2021~2025)·Creden(2016~2020), 판매 법인 NFT. */
export function books() {
  return {
    총수익16: n('총수익_2016'), 총수익22: n('총수익_2022'), 총수익25: n('총수익_2025'), CAGR: n('CAGR'),
    손실22: n('순손실_2022'), 손실23: n('순손실_2023'), 순이익25: n('순이익_2025'), 본업25: n('본업_2025'),
    NFT21: n('NFT_2021'), NFT25: n('NFT_2025'), NFT이익21: n('NFT순이익_2021'), NFT이익25: n('NFT순이익_2025'),
  };
}

/** 조달·판로·제품 — ISSF·MSC·ImportYeti·IEc·식약청·Thai Union·식약처. */
export function trade() {
  return {
    참치: n('참치몫'), 펫: n('펫몫'), 고등어: n('고등어몫'), 연어: n('연어몫'),
    선적: n('선적'), BB: n('BumbleBee'), IEc: n('IEc_t'), MSC비중: n('MSC비중'), MSC: s('MSC'), MSC만료: s('MSC만료'),
    Sealect: n('Sealect'), 등록: n('등록_식품'), 등록참치: n('등록_참치'), 한국태국: n('한국_태국참치'),
    인원: n('DIW_인원'), 코로나: n('코로나'),
  };
}
