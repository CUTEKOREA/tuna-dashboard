// squid v5 데이터 흡수 계층.
//
// 위젯 컴포넌트가 public/data 를 직접 읽지 않도록 이 모듈만 JSON 을 import 한다
// (__tests__/architecture-guards.test.ts 가 강제). 파일 자체는
// scripts/squid_build 가 생성하고 scripts/validate_squid_v5.py 의 측정 게이트를
// 통과해야만 발행되므로, 여기서 다시 검증하지 않고 타입만 입힌다.
import type { SquidV5 } from '../../components/squid/types';
import raw from '../../public/data/squid_v5.json';

const document = raw as unknown as SquidV5;

export function getSquidV5(): SquidV5 {
  return document;
}

export type { SquidV5 };
