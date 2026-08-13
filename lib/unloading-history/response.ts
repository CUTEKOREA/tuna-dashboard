import { NextResponse } from 'next/server';
import { getUnloadingHistoryResponse } from './server-data';
import { UnloadingHistoryPublicResponseSchema } from './schema';

export function buildUnloadingHistoryResponse(
  load: () => unknown = getUnloadingHistoryResponse,
): NextResponse {
  try {
    return NextResponse.json(UnloadingHistoryPublicResponseSchema.parse(load()));
  } catch {
    return NextResponse.json(
      { success: false, error: '과거 하역 이력을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
