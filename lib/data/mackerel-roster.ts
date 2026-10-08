/**
 * 고등어 명부 인테이크. 컴포넌트는 이 조회만 쓰고 JSON을 직접 import하지 않는다.
 *
 * 공급·가공·브랜드 표는 기존 `getMackerelCompanyResearch()`(valuechain-companies)를 쓴다.
 * 여기 반환값은 그 공유 타입이 담지 않는 「명부」 절뿐이다.
 */
import raw from '@/public/data/mackerel_company_research_v1.json';

export type MackerelRosterRow = {
  구분: string;
  법인명: string;
  핵심값: string;
  성격: string;
  출처: string;
  비고: string;
};

export type MackerelRosterBlock = {
  제목: string;
  기준: string;
  rows: MackerelRosterRow[];
};

export type MackerelRoster = {
  요지: string;
  수입명의: MackerelRosterBlock;
  국내가공: MackerelRosterBlock;
};

export function getMackerelRoster(): MackerelRoster {
  return (raw as typeof raw & { 명부: MackerelRoster }).명부;
}
