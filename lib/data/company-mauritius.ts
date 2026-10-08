import raw from '@/public/data/companies/mauritius_v1.json';

/**
 * 모리셔스 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅡ, 2026-09).
 *
 * 포트루이스에 남은 참치 가공 승인은 셋이고 그 셋을 가진 법인은 둘이다 — 리슈테르와
 * 마린로드의 Princes Tuna (Mauritius) Ltd, 그리고 같은 마린로드 주소의 Indico Canning.
 * 그 공장을 지분법으로 드는 모리셔스 상장 그룹 IBL 의 장부에서 같은 해가 두 번 다르게 적힌다.
 *
 * ⚠ **「참치 공장이 하나」 금지** — 승인은 셋(DVS/TF/1 · DVS/FP4/MU · DVS/FP8/MU)이고
 *    법인은 둘이다. PTM 이 승인 둘, Indico Canning 이 하나를 갖는다.
 * ⚠ **「한 법인」 금지** — Indico Canning 은 영국 Princes 가 간접 68 %를 가진 **별개 법인**이다.
 * ⚠ **40,64 %와 43,68 % 혼용 금지** — 앞은 IBL 그룹의 **유효지분**(직접 23,37 + 간접 17,27),
 *    뒤는 **지분법 적용률**이다. 기준이 다른 두 수라 바꿔 쓰거나 같은 값으로 묶지 않는다.
 * ⚠ **「결산일 차이로 설명된다」 금지** — IBL 지분법 회계정책 전문에 관계회사의 결산일 차이나
 *    재무정보 조정을 다루는 문장이 없다. 사유는 IBL 공시 어디에도 나오지 않는다.
 * ⚠ **「손상 63.344 = 영업권 감소」 금지** — 회계정책이 「인식한 손상은 영업권을 포함한 어떤
 *    자산에도 배분하지 않는다」고 적는다. 62.819 와 63.344 가 가깝다는 것과 같은 사건이라는 것은 다르다.
 * ⚠ **「SFPA 가 2026-12-21 만료」 금지** — 잠정 적용 시작이 2022-12-21 이고 **이행의정서가
 *    끝나는 날은 2026-12-20** 이다. 본협정 자체의 만료일이 아니다.
 * ⚠ **「DG SANTE 지적 4건」 금지** — 본문이 서술한 지적 유형이 넷일 뿐이고 **권고는 10건**이다.
 * ⚠ **「IOTPS 가 2016-10-09 폐쇄」 단정 금지** — 예고 보도만 있고 사후 기록이 없다.
 * ⚠ **「네덜란드 = 재수출」 금지** — 통관지와 최종 소비지를 가르는 자료가 이 원장에 없다.
 * ⚠ 사내 자료는 쓰지 않았다. 전부 공시·당국 문서·세관 신고·공개 매체다.
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
  if (typeof v !== 'number') throw new Error(`mauritius stats.${key} 가 숫자가 아니다`);
  return v;
}

export const mauritiusMeta = data._meta;
export const mauritiusCard = data.card;
export const mauritiusStats = data.stats;
export const mauritiusSourceNotes = data.sourcenotes;

/**
 * 같은 회사를 가리키는 세 지분 숫자. **기준이 다르므로 서로 빼지 않는다.**
 *
 * ⚠ 40,64 %(유효지분)와 43,68 %(지분법 적용률)를 한 값으로 묶지 않는다.
 * ⚠ `100 − 51 − 43,68 = 5,32` 는 잔여 지분율이 아니다 — 기준이 다른 두 수를 뺀 것이다.
 */
export function equityBasis(): {
  Princes_직접_pct: number;
  IBL_유효_pct: number; IBL_직접_pct: number; IBL_간접_pct: number;
  IBL_지분법적용률_pct: number;
  Indico_Princes_간접_pct: number;
  단서: string;
} {
  return {
    Princes_직접_pct: n('Princes_직접지분_pct'),
    IBL_유효_pct: n('IBL_유효지분_pct'),
    IBL_직접_pct: n('IBL_직접지분_pct'),
    IBL_간접_pct: n('IBL_간접지분_pct'),
    IBL_지분법적용률_pct: n('IBL_지분법적용률_pct'),
    Indico_Princes_간접_pct: n('Indico_Princes_간접지분_pct'),
    단서: '유효지분과 지분법 적용률은 기준이 다른 두 수다',
  };
}

/**
 * 다섯 해의 몫 — 공시 순이익 × 43,68 % 와 IBL 이 실제로 인식한 값.
 *
 * ⚠ 차이의 사유를 붙이지 않는다. IBL 공시 어디에도 없다.
 */
export function shareGap(): {
  연도별: { 회계연도: string; 순이익_천Rs: number; 인식몫_천Rs: number; 산술몫_천Rs: number }[];
  순이익_4년합_천Rs: number; 산술몫_4년합_천Rs: number; 인식몫_4년합_천Rs: number;
  미상쇄_천Rs: number;
  단서: string;
} {
  const years = ['FY2021', 'FY2022', 'FY2023', 'FY2024', 'FY2025'];
  return {
    연도별: years.map((y) => ({
      회계연도: y,
      순이익_천Rs: n(`PTM_순이익_${y}_천Rs`),
      인식몫_천Rs: n(`IBL_인식몫_${y}_천Rs`),
      산술몫_천Rs: n(`산술몫_${y}_천Rs`),
    })),
    순이익_4년합_천Rs: n('순이익_4년합_FY2022_FY2025_천Rs'),
    산술몫_4년합_천Rs: n('산술몫_4년합_천Rs'),
    인식몫_4년합_천Rs: n('인식몫_4년합_천Rs'),
    미상쇄_천Rs: n('미상쇄_4년차_천Rs'),
    단서: 'FY2022~FY2025 네 해를 합쳐도 상쇄되지 않는다',
  };
}

/**
 * 이듬해 보고서에서 사유 없이 바뀐 FY2023 세 줄 (Rs'000).
 *
 * ⚠ 「전기오류 수정」으로 옮기지 않는다 — 두 보고서 모두 사유를 적지 않고, 재무제표 본문에도
 *    재표시를 밝히는 문장이 이 항목에 붙어 있지 않다.
 */
export function restatedRows(): {
  항목: string; 판2023_천Rs: number; 판2024_천Rs: number; 차_천Rs: number;
}[] {
  const rows: [string, string][] = [
    ['비유동자산', '비유동자산'],
    ['비지배 귀속 자본', '비지배귀속자본'],
    ['영업권', '영업권'],
  ];
  return rows.map(([label, key]) => {
    const a = n(`재표시_${key}_2023판_천Rs`);
    const b = n(`재표시_${key}_2024판_천Rs`);
    return { 항목: label, 판2023_천Rs: a, 판2024_천Rs: b, 차_천Rs: b - a };
  });
}
