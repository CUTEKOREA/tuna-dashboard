import raw from '@/public/data/ffa_vrst_v1.json';

/**
 * FFA 조업허가 선단(Good Standing) + VMS 주간 보고현황 인테이크.
 *
 * FFA 회원국 수역에서 조업할 자격을 얻은 선박 전수와, 그 선박들이 2주간
 * 위치보고를 몇 건 보냈는지가 함께 담긴다. 다른 등록부에 없는 것은 **뒤쪽**이다 —
 * 누가 등록돼 있는지가 아니라 누가 실제로 신호를 보내고 있는지.
 *
 * ⚠ **측정 경계.** 조업허가는 자격이지 조업 실적이 아니다. 일별 숫자는 VMS 위치보고
 *   건수이며 조업일이 아니다. 어획량과는 아무 관계가 없다.
 *
 * ⚠ **원본 집계 시트를 쓰지 않았다.** FFA 가 붙여 둔 국기×선종 집계표는 선종 열 합이
 *   실제 척수와 1척 어긋난다(중국 행). 선박별 원표에서 직접 세었다.
 */

export type FlagRow = { 국기: string; 척수: number } & Record<string, string | number>;
export type TypeRow = { 선종: string; 척수: number };
export type NormRow = { 선종: string; 표준주기: number };
export type BelowNormRow = {
  선명: string; 국기: string; 선종: string;
  자체주기: number; 선종표준: number; VMS: string;
};
export type NotReportingRow = {
  선명: string; 국기: string; 선종: string; 사유: string;
  무보고일: number; 결손일: number; 자체주기: number;
  선종표준: number; 표준미달: boolean; 적용일: number;
};
export type OwnerRow = { 선주: string; 표기수: number; 척수: number; 선박: string[] };
export type HoldRow = { 선명: string; 선종: string; 용량: number; 단위: string };

const data = raw as unknown as {
  _meta: { 출처: string; 기간: string; 등급: string; 주의: string; 측정경계: string; 단위경고: string; 갱신방법: string };
  요약: { 총척수: number; 국기수: number; 미보고척수: number; 한국척수: number; 일수: number };
  국기별: FlagRow[];
  선종별: TypeRow[];
  선종표준: NormRow[];
  표준미달: BelowNormRow[];
  미보고: NotReportingRow[];
  한국선단: { 선종별: TypeRow[]; 선주별: OwnerRow[]; 어창: HoldRow[]; 어창단위: Record<string, number> };
  일자: string[];
};

export const ffaMeta = data._meta;
export const ffaSummary = data.요약;
export const ffaByFlag = data.국기별;
export const ffaByType = data.선종별;
export const ffaTypeNorms = data.선종표준;
export const ffaBelowNorm = data.표준미달;
export const ffaNotReporting = data.미보고;
export const ffaKorea = data.한국선단;
export const ffaDays = data.일자;

/**
 * FFA 는 정상(ACTIVE)이라 표기했지만 실제 보고건수가 선종 표준에 못 미치는 배.
 *
 * 이 목록이 이 자료의 값이다. FFA 자신의 미보고 표기만 보면 놓친다 —
 * 표기와 실제가 어긋나는 구간이 여기다.
 */
export function activeButShort(): BelowNormRow[] {
  return data.표준미달.filter((r) => r.VMS === 'ACTIVE' || r.VMS === '정상');
}

/** 상위 n개국. 나머지는 「그 외」로 묶는다 — 20개국을 다 그리면 라벨이 뭉갠다. */
export function topFlags(n = 8): { 국기: string; 척수: number }[] {
  const sorted = [...data.국기별].sort((a, b) => b.척수 - a.척수);
  const head = sorted.slice(0, n).map((r) => ({ 국기: r.국기, 척수: r.척수 }));
  const rest = sorted.slice(n).reduce((a, r) => a + r.척수, 0);
  return rest > 0 ? [...head, { 국기: '그 외', 척수: rest }] : head;
}

/**
 * 한국 선망선 어창 용량. **단위별로 나눠서만 돌려준다** —
 * ㎥ 와 t 를 한 배열에 담으면 어디선가 합쳐진다.
 */
export function koreaHoldsByUnit(unit: string): HoldRow[] {
  return data.한국선단.어창.filter((h) => h.단위 === unit);
}
