/**
 * 명태 기업 조사 큐레이션. 컴포넌트는 이 조회만 쓰고 JSON을 직접 import하지 않는다.
 */
import raw from '@/public/data/pollock_company_research_v1.json';

export type PollockRosterRow = {
  회사: string;
  위치: string;
  규모: string;
  내용: string;
  성격: string;
  출처: string;
};

export type PollockProcessorRow = {
  국가: string;
  공장: string;
  기업: string;
  출처: string;
  등급: string;
};

export type PollockBrandRow = {
  시장: string;
  브랜드: string;
  소유: string;
  실적: string;
  점유율: string;
  성격: string;
};

export type PollockCompanyResearch = {
  _meta: Record<string, unknown>;
  공급: { 요지: string; rows: PollockRosterRow[] };
  가공: { 요지: string; rows: PollockProcessorRow[] };
  브랜드: { 요지: string; rows: PollockBrandRow[] };
  수입명의: { 요지: string; rows: PollockRosterRow[] };
  국내가공상위: { 요지: string; rows: PollockRosterRow[] };
  연결42: { 요지: string; rows: PollockRosterRow[] };
  상장사: { 요지: string; rows: PollockRosterRow[] };
};

export function getPollockCompanyResearch(): PollockCompanyResearch {
  return raw as unknown as PollockCompanyResearch;
}
