/**
 * 「시장 이해 > 문어」 데이터 인테이크 (ADR 0005).
 *
 * `lib/data/commodity-industry.ts` 에 끼우지 않고 따로 둔 이유: 문어 JSON 은 명부까지 담고,
 * 공용 인테이크를 여러 작성자가 동시에 고치는 중이라 한 파일을 나누는 편이 안전하다.
 *
 * ⚠ 문어라는 이름이 세 칸을 가리킨다. 칸마다 필드를 따로 두고 더하지 않는다.
 *   · 0307521000 냉동 문어 — 문어 전용 세번
 *   · 1605550000 조제 문어류 — 종 분리 없는 바스켓(2022~)
 *   · FAO OCT(한국) — 문어류·낙지·주꾸미 3종 합
 *
 * 옛 낙지 페이지의 통관 API와 옛 JSON 은 읽지 않는다. 라벨이 낙지와 섞여 있다.
 * 정적 산출물이라 텔레메트리는 STATIC 이다(L-09).
 */
import rawIndustry from '../../public/data/octopus_industry_v1.json';
import rawCompany from '../../public/data/octopus_company_research_v1.json';

type Meta = Record<string, unknown>;

export type OctopusWorldPoint = { 연도: string } & Record<string, string | number>;

export interface OctopusTradeRow {
  연도: string;
  냉동문어_톤: number;
  냉동문어_백만달러: number;
  냉동문어_단가: number;
  /** 1605550000 은 2022년에 생겼다. 그 전은 0 이 아니라 칸이 없다. */
  조제문어류_톤: number | null;
  조제문어류_백만달러: number | null;
  조제문어류_단가: number | null;
  냉동문어_수출톤: number;
}

export interface OctopusOriginRow {
  국가: string;
  수입액: number;
  수입량톤: number;
  단가: number;
}

export interface OctopusCategoryRow {
  카테고리: string;
  코드: string;
  제품: number;
  제조사: number;
  주원료: number;
  보고2025: number;
  생산2024: number;
  생산2025: number;
}

export interface OctopusIndustryData {
  _meta: Meta;
  세계어획: {
    _meta: Meta;
    시계열: OctopusWorldPoint[];
    국가2024: { 국가: string; 어획량: number; 주석?: string }[];
  };
  한국생산: { _meta: Meta; 연도별: { 연도: string; 문어류: number; 낙지류: number; 주꾸미: number }[] };
  위판: { _meta: Meta; 연도별: { 연도: string; 물량: number; 단가: number }[] };
  수입: {
    _meta: Meta;
    연도별: OctopusTradeRow[];
    냉동원산지2025: OctopusOriginRow[];
    조제원산지2025: OctopusOriginRow[];
  };
  제품전수: {
    _meta: Meta;
    합계: Record<string, number>;
    카테고리: OctopusCategoryRow[];
    상위제품2025: { 제품: string; 제조: string; 생산2025: number; 카테고리: string }[];
  };
  원료달력: {
    _meta: Meta;
    rows: { 월: string; 금어기: string; 위판물량: number; 위판가: number; 모로코: string; 모리타니: string; 냉동수입: number }[];
  };
  시장비교: {
    _meta: Meta;
    rows: { 시장: string; 수입액: number; 물량: number; 단가: number; 특징: string }[];
    한국연도별: { 연도: string; 수입액: number; 금액순위: number; 물량: number; 물량순위: number; 단가: number }[];
  };
  키워드추이: { _meta: Meta; rows: { 형태: string; 제품: number; 허가2023_26: number; 생산2023: number; 생산2025: number }[] };
  /** 보고서 §09. 내부 검토이며 우선순위는 정성 판단이다. */
  OEM후보: { _meta: Meta; rows: { 우선: string; 제품: string; 근거: string; 채널: string; 방식: string }[] };
  /** 신라에스지 부산공장 기준 내부 검토. 문어 생산 실적이 아니다. */
  설비적합: { _meta: Meta; rows: { 형태: string; 공정: string; 근거: string; 판정: string }[] };
  소매표본: {
    _meta: Meta;
    rows: { 형태: string; 상품수: number; 최저: number; 중앙: number; 최고: number; 비고: string }[];
  };
}

export interface OctopusRosterRow {
  회사: string;
  위치: string;
  규모: string;
  내용: string;
  성격: string;
  출처: string;
}

export interface OctopusRosterBlock {
  요지: string;
  rows: OctopusRosterRow[];
}

export interface OctopusCompanyResearch {
  _meta: Meta;
  국내가공: OctopusRosterBlock;
  등록상위: OctopusRosterBlock;
  수입명의: OctopusRosterBlock;
  해외가공: OctopusRosterBlock;
  /** 신라에스지 — 문어 시장 크기가 아니다. 화면에서 「내부 검토」로 라벨한다. */
  내부검토: OctopusRosterBlock;
}

export function getOctopusIndustryData(): OctopusIndustryData {
  return rawIndustry as unknown as OctopusIndustryData;
}

export function getOctopusCompanyResearch(): OctopusCompanyResearch {
  return rawCompany as unknown as OctopusCompanyResearch;
}
