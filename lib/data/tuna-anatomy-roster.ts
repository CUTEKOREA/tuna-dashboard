/**
 * 참치 해부 명부 인테이크. 컴포넌트는 이 조회만 쓰고 JSON을 직접 import하지 않는다.
 */
import raw from '@/public/data/tuna_anatomy_roster_v1.json';

export type TunaAnatomyRosterRow = {
  회사: string;
  위치: string;
  규모: string;
  내용: string;
  성격: string;
  출처: string;
};

export type TunaAnatomyRosterBlock = {
  요지: string;
  rows: TunaAnatomyRosterRow[];
};

export type TunaAnatomyRoster = {
  _meta: Record<string, unknown>;
  원양선사: TunaAnatomyRosterBlock;
  국내캔: TunaAnatomyRosterBlock;
  국내횟감: TunaAnatomyRosterBlock;
  수입명의: TunaAnatomyRosterBlock;
  해외가공: TunaAnatomyRosterBlock;
  브랜드제품: TunaAnatomyRosterBlock;
};

export function getTunaAnatomyRoster(): TunaAnatomyRoster {
  return raw as unknown as TunaAnatomyRoster;
}
