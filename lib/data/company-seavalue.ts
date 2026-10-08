import raw from '@/public/data/companies/seavalue_v1.json';

/**
 * Sea Value Group 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅦ, 2026-09).
 *
 * 태국 사뭇사콘의 비상장 캔참치 OEM 그룹. 계열은 Sea Value · Unicord · I.S.A. Value 셋이다.
 *
 * ⚠ **법인을 섞지 마라.** 1989년에 Bumble Bee를 산 것은 **Unicord**이고,
 *   지금 캔을 미국으로 보내는 것은 **I.S.A. Value**(2004년 설립)다. 둘은 자매다.
 *   「그 회사의 공장이 Bumble Bee 캔을 만든다」를 담은 문서는 하나도 없다.
 * ⚠ **Unicord 재무제표는 개별이다.** 연차보고서가 「50% 초과 자회사 없음」이라 적고
 *   주석 1.1이 「연결재무제표는 모회사가 작성」이라 적는다. 그룹 규모로 쓰면 틀린다.
 * ⚠ **「Sea Value가 Bumble Bee 지분을 가졌다」는 방향이 반대다.**
 *   원문은 "Bumble Bee owns a 10 percent share in Sea Value"다.
 * ⚠ **「한국이 잡은 가다랑어의 절반 넘게가 태국으로」는 거짓이다.** 그것은 수출 분모이고
 *   어획 분모로는 세 해 모두 절반이 안 된다.
 * ⚠ **미국 매대 값을 이 회사 값으로 쓰지 마라.** Great Value·StarKist·COTS·Bumble Bee 넷 다
 *   Sea Value 팩으로 확정되지 않았다. 방어 가능한 사다리는 태국 THB/kg 하나다.
 * ⚠ **부재를 한 등급으로 뭉개지 마라.** FDA·태국 노동부는 A, 나머지 넷은 ✗다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const seavalueMeta = data._meta;
export const seavalueCard = data.card;
export const seavalueStats = data.stats;
export const seavalueSourceNotes = data.sourcenotes;

/** 자체 브랜드 라이브 SKU 가운데 참치가 차지하는 몫(%). */
export function ownBrandTunaShare(): number {
  return Number(((data.stats.자체브랜드_참치_행 / data.stats.자체브랜드_총행) * 100).toFixed(1));
}

/** 캐나다 두 건이 Bumble Bee 컨테이너의 몇 배인가. */
export function canadaVsBumbleBee(): number {
  return Number((data.stats.캐나다_2건_kg / data.stats.bumblebee_컨테이너_kg).toFixed(1));
}

/** 한국 가다랑어 태국행 비중 — 분모를 바꾸면 얼마나 내려가는가(%p). */
export function denominatorGap(): number {
  return Number((data.stats.한국가다랑어_수출중_2024 - data.stats.한국가다랑어_어획중_2024).toFixed(1));
}
