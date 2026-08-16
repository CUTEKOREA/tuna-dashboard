import type { FleetDailyDetailState } from '@/lib/contracts/fleet-daily-api';

export function fleetDetailGateMessage(state: FleetDailyDetailState): string {
  if (state.status === 'loading' || state.status === 'ready') return '서버 권한을 확인하는 중입니다.';
  if (state.code === 'authentication_required') {
    return '최신 좌표·비고·일정·적재 상세를 보려면 서버 로그인이 필요합니다.';
  }
  if (state.code === 'mfa_required') return '선박 상세는 2단계 인증 후 표시됩니다.';
  if (state.code === 'fleet_access_required') return '이 계정에는 선단 상세 권한이 없습니다.';
  if (state.code === 'fleet_auth_unavailable') return '권한 확인 서버를 사용할 수 없습니다.';
  if (state.code === 'fleet_data_unavailable') return '선박 상세 데이터가 공개 집계와 맞지 않습니다.';
  return '보호된 상세를 불러올 수 없습니다.';
}
