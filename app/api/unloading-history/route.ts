import { buildUnloadingHistoryResponse } from '@/lib/unloading-history/response';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  return buildUnloadingHistoryResponse();
}
