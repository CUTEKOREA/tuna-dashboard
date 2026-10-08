import raw from '@/public/data/companies/bounty_v1.json';

/**
 * Bounty Seafood Limited 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅦ, 2026-09).
 *
 * 파푸아뉴기니 모로베주 라에 말라항 공단 Portion 679 에 등기된 동원산업 100 % 자회사다.
 * 2012년에 일 150톤 로인 공장을 세우겠다는 계획으로 만들어졌고 **그 공장은 서지 않았다.**
 * 다만 **동원산업은 그 나라에 있다** — 수산업협회 회원명부가 선망 조업사로 적고, 수산청
 * 2025-02-17 성명이 마당 RD Tuna Canners 재편을 받치는 쪽에 그 이름을 적는다.
 *
 * ⚠ **금칙 (정본 `~/tunawork/bounty/notes/00_기준선_메인확인.md` §2 · `build/killed.py` 26패턴).**
 *
 * 1. **「동원산업이 파푸아뉴기니에서 철수했다·사라졌다」 금지** — 협회 회원명부에
 *    `Dongwon Industries Co., Limited — Purse Seine Fishing Operation` 으로 있다.
 *    없는 것은 회사가 아니라 자기 이름의 공장이다.
 * 2. **「Bounty 가 공장을 돌린다」 금지** — 가공장을 이름으로 적는 명부 넷 어디에도 없다.
 * 3. **「공장이 없다」를 대조군 없이 쓰지 않는다** — 같은 명부가 여섯 공장을 잡는다는 사실과
 *    함께 적는다. 수산청 2025-02-17 성명은 **회사 이름을 적지 않으므로 대조군이 아니다.**
 * 4. **「수산청이 신규 외국인투자 0 이라 적는다」 금지** — 그 문서에 없는 문장이다.
 * 5. **선박기록 12척으로 부재를 말하지 않는다** — 전수가 아니고 국적 선망은 50척대다.
 * 6. **「법인이 말소됐다」 금지** — 회사 등록 1-80688 은 Registered 다. 꺼진 것은
 *    외국인기업 인증 93137(2026-01-11 Cancelled)이다.
 * 7. **설립을 2012년으로 적지 않는다** — 등기 2011-10-20, 공시 연혁 2011-10-19 이고
 *    2012-05-15·05-16 은 취득일·대여일이다. **표지 문구까지 이 금칙에 걸린다.**
 * 8. **「대여금을 떼였다」 금지** — 공시는 전액 충당금만 적고 상각·포기·소송을 적지 않는다.
 * 9. **키리바시 합산 충당금(13.398·16.778백만원)을 이 회사 단독으로 적지 않는다** —
 *    단독 마지막 값은 2024년 723.906천원이다.
 * 10. **2025 타법인출자 표의 당기순손익 622 를 순이익으로 읽지 않는다** — 그 표는 전 행이
 *    총자산을 복제한 기재다.
 * 11. **원 단위 취득금액(5.641만 3.000원)을 쓰지 않는다** — 그 값이 실린 공시 원문이 없다.
 *    공시 기재는 56백만원이다.
 * 12. **「Majestic 이 679필지에 섰다」 금지** — Majestic 은 Portion 640 이다.
 * 13. **수산청 성명의 도시를 라에로 적지 않는다** — 동원산업이 이름을 올린 재편은 **마당**의
 *    RD Tuna Canners 건이고, 같은 성명의 라에 대목은 다른 회사 재가동이다.
 * 14. **「그 나라가 34만 8.090톤을 잡는다」 금지** — 그 값은 **외국선단이 이 나라 수역에서**
 *    잡은 것이다. 국적선단은 다른 표의 32만 9.075,3톤이고 **공간 단위도 다르다**(EEZ 대 협약수역).
 *    두 값을 더하지 않는다.
 * 15. **나라 단위 수치(58척·가공 6기·가공물량·무역통계)를 이 회사 몫으로 옮기지 않는다.**
 * 16. **「150에서 200으로 올랐다」 금지** — 유럽의회 연구(2012-09, 교섭 중)가 150,
 *    업계 연감(2013·2014, 승인 후)이 200 인데 사이를 잇는 승인 문서가 공개되지 않았다.
 * 17. **어업면허 「초기 4 + 증산 시 6」을 이 계획에 붙이지 않는다** — Majestic 공장 이야기다.
 *     Dongwon 과 Halisheng 은 **각각 열 개**를 받았다.
 * 18. **「Dongwon 이 국가행정평의회 승인을 받았다」 금지** — 2012년 9월 시점 상태는 교섭 중이고,
 *     승인을 받은 것은 Nambawan 과 Niugini Tuna 다.
 * 19. **Niugini Tuna 를 「무산됐다」로 단정하지 않는다** — 여섯 공장 명부에 이름이 없다는 것까지다.
 *     **회사명 없이 셈으로 우회하는 것도 같은 금칙이다**(「80을 받은 둘 가운데 하나만 세웠다」).
 * 20. **매대 수치를 이 회사 제품으로 적지 않는다** — 여섯 공장(또는 그 브랜드주)의 것이다.
 * 21. **`white`·`light` 를 법정 용어로 쓰지 않는다** — 규정 1536/92 가 정의하는 것은
 *     solid·chunks·fillets·flakes·grated 다.
 * 22. **원어 표기를 충전지로 읽지 않는다** — 「origins: Papua New Guinea」는 원어가 그 나라
 *     산이라는 뜻이고 그 나라에서 캔을 채웠다는 뜻이 아니다.
 * 23. **파푸아뉴기니 내수 SKU 에 물뺀 기준 $/kg 을 만들지 않는다** — 정면 라벨에 표기가 없다.
 * 24. **이 회사에 노동·제재 기록을 옮기지 않는다** — 확인된 바 없다. RD Tuna 의 2010년
 *     최저임금·파업 기록은 다른 회사 것이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — 등록번호·날짜·상태는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`bounty stats.${key} 가 숫자가 아니다`);
  return v;
}

export const bountyMeta = data._meta;
export const bountyCard = data.card;
export const bountyStats = data.stats;
export const bountySourceNotes = data.sourcenotes;

/**
 * 등기는 살아 있고 인증은 꺼졌다.
 *
 * ⚠ **두 번호를 섞지 않는다.** 회사 등록(1-80688)은 Registered 이고, 취소된 것은 외국인기업
 *    인증(93137)이다. 투자진흥법 제25조 2항이 인증 없는 외국기업의 영업을 금하고 제36조 3항이
 *    취소 뒤 청산 목적의 한시 영업만 남긴다. **취소 사유는 공개되지 않는다.**
 * ⚠ 등기의 자본금 0·영업 중 「아니오」 표기는 **가동 중인 Majestic 등기도 같은 값**이라
 *    이 회사의 특징이 아니다.
 */
export function registry(): {
  회사등록번호: string;
  회사등록상태: string;
  인증번호: string;
  인증상태: string;
  인증비활성일: string;
  설립일_등기: string;
  설립일_공시: string;
  제적일: string;
  복권일: string;
  연차보고기한: string;
  벌금상한_키나: number;
} {
  return {
    회사등록번호: String(data.stats['회사등록번호']),
    회사등록상태: String(data.stats['회사등록상태']),
    인증번호: String(data.stats['외국인기업인증번호']),
    인증상태: String(data.stats['외국인기업인증상태']),
    인증비활성일: String(data.stats['인증비활성일']),
    설립일_등기: String(data.stats['설립일_등기']),
    설립일_공시: String(data.stats['설립일_공시연혁']),
    제적일: String(data.stats['등기제적일']),
    복권일: String(data.stats['등기복권일']),
    연차보고기한: String(data.stats['연차보고기한']),
    벌금상한_키나: n('투자진흥법_벌금_키나'),
  };
}

/**
 * 나간 돈과 그 뒤로 없는 흐름.
 *
 * ⚠ **대여금 원금은 달러로 고정돼 있다.** 일곱 시점의 원화 잔액을 그날의 매매기준율로 나누면
 *    전부 401.232 달러다. 회수나 추가대여가 한 번이라도 있었으면 닫히지 않는다.
 *    기준일이 휴장일인 2022·2023년 말은 직전 영업일(12-30 · 12-29) 고시값이다.
 * ⚠ **충당금은 2025년부터 키리바시 법인과 합산으로만 공시된다.** 단독 마지막 값이 2024년이다.
 * ⚠ **총자산과 대여금은 다른 장부다** — 앞은 현지 법인이 보고한 값, 뒤는 동원산업 별도 장부다.
 *    「자산이 전부 모회사 돈」으로 단정하지 않는다.
 */
export function money(): {
  취득금액_백만원: number;
  장부가_백만원: number;
  손상_백만원: number;
  총자산_2025_백만원: number;
  총자산_2026반기_백만원: number;
  원금_USD: number;
  잔액_2026반기_천원: number;
  미수금_천원: number;
  충당금_2024단독_천원: number;
  회수누계_천원: number;
  이자율_pct: number;
  매출행: number;
  매입행: number;
  보증행: number;
} {
  return {
    취득금액_백만원: n('최초취득금액_백만원'),
    장부가_백만원: n('기말장부가_백만원'),
    손상_백만원: n('손상차손_백만원'),
    총자산_2025_백만원: n('총자산_2025_백만원'),
    총자산_2026반기_백만원: n('총자산_2026반기_백만원'),
    원금_USD: n('대여원금_USD'),
    잔액_2026반기_천원: n('대여잔액_2026반기_천원'),
    미수금_천원: n('미수금_천원'),
    충당금_2024단독_천원: n('충당금_2024_단독_천원'),
    회수누계_천원: n('회수누계_천원'),
    이자율_pct: n('대여이자율_pct'),
    매출행: n('특수관계자_매출행'),
    매입행: n('특수관계자_매입행'),
    보증행: n('지급보증행'),
  };
}

/**
 * 이름을 적는 명부와 거기 없는 회사.
 *
 * ⚠ **부재를 말할 수 있는 명부는 회사 이름을 칸으로 적는 것뿐이다.** 수산청 2025-02-17 성명은
 *    「여섯 곳」이라는 수만 적으므로 대조군이 되지 않는다.
 * ⚠ **유럽연합 승인시설 목록의 부재가 가장 무겁다** — 그 목록에 번호가 없으면 유럽으로 실을 수
 *    없고, 이 나라 캔공장이 서는 이유가 그 통로다.
 */
export function registers(): {
  EU전수: number;
  EU육상가공장: number;
  EU_Bounty등재: number;
  FIA가공회원: number;
  등기필지: number;
  Majestic필지: number;
  IFC필지: number;
  Nambawan필지: number;
  Atuna_Bounty건: number;
  Atuna_Dongwon건: number;
  Atuna_PNG건: number;
  Atuna_동시건: number;
  EP_Bounty문자열: number;
} {
  return {
    EU전수: n('EU승인시설_PNG_전수'),
    EU육상가공장: n('EU승인시설_PNG_육상가공장'),
    EU_Bounty등재: n('EU승인시설_Bounty_등재'),
    FIA가공회원: n('FIA_가공회원_수'),
    등기필지: n('등기필지'),
    Majestic필지: n('Majestic_필지'),
    IFC필지: n('IFC_필지'),
    Nambawan필지: n('Nambawan_필지'),
    Atuna_Bounty건: n('Atuna_Bounty_건'),
    Atuna_Dongwon건: n('Atuna_Dongwon_건'),
    Atuna_PNG건: n('Atuna_PNG_건'),
    Atuna_동시건: n('Atuna_Dongwon_PNG동시_건'),
    EP_Bounty문자열: n('EP_Bounty_문자열'),
  };
}

/**
 * 2012년에 줄 선 여섯과 그 나라의 바다.
 *
 * ⚠ **계획 용량은 갈래가 있다** — 유럽의회 연구 150(교섭 중), 업계 연감 200(승인 후).
 *    사이를 잇는 승인 문서가 공개되지 않아 상향 인과를 쓸 수 없다.
 * ⚠ **어획 두 값은 공간 단위가 다르다** — 외국선단 값은 배타적경제수역, 국적선단 값은
 *    협약수역 전체다. 더하지 않는다.
 */
export function context(): {
  EP문서번호: string;
  EP후보수: number;
  viability_pct: number;
  계획용량_EP_t: number;
  계획용량_업계지_t: number;
  면허수: number;
  외국선단_EEZ_선망_t: number;
  국적선망_협약수역_t: number;
  국적연승_t: number;
  국적선망_척: number;
  협회기준_척: number;
  가공공장수: number;
  가공물량_2024_t: number;
  MFN관세_pct: number;
  조달예외조항: string;
} {
  return {
    EP문서번호: String(data.stats['EP문서번호']),
    EP후보수: n('EP_Table5_후보수'),
    viability_pct: n('EP_viability_pct'),
    계획용량_EP_t: n('EP_계획용량_t일'),
    계획용량_업계지_t: n('업계지_계획용량_t일'),
    면허수: n('어업면허_수'),
    외국선단_EEZ_선망_t: n('외국선단_EEZ_선망_t'),
    국적선망_협약수역_t: n('국적선망_협약수역_t'),
    국적연승_t: n('국적연승_t'),
    국적선망_척: n('국적선망_척_2025'),
    협회기준_척: n('협회기준_척_2025'),
    가공공장수: n('가공공장_수'),
    가공물량_2024_t: n('가공물량_2024_t'),
    MFN관세_pct: n('MFN관세_pct'),
    조달예외조항: String(data.stats['조달예외조항']),
  };
}

/**
 * 서지 않은 공장이 만들지 못한 물건 — 여섯 공장의 매대.
 *
 * ⚠ **이 값은 전부 남의 것이다.** 이 회사에는 제품이 없다.
 * ⚠ 순중량 기준이다. 파푸아뉴기니 내수 캔 정면 라벨에 물뺀중량 표기가 없다.
 */
export function shelf(): {
  최저_USD_kg: number;
  RD최저_USD_kg: number;
  RD최고_USD_kg: number;
  RD배수: number;
  수입최고_USD_kg: number;
  환산율: number;
  물뺀하한_pct: number;
} {
  return {
    최저_USD_kg: n('매대_최저_USD_kg'),
    RD최저_USD_kg: n('매대_RD최저_USD_kg'),
    RD최고_USD_kg: n('매대_RD최고_USD_kg'),
    RD배수: n('매대_RD배수'),
    수입최고_USD_kg: n('매대_수입최고_USD_kg'),
    환산율: n('환산율_PGK_USD'),
    물뺀하한_pct: n('EU규격_어육하한_자숙_pct'),
  };
}
