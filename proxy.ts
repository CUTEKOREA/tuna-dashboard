import type { NextRequest } from 'next/server';
import { updateDashboardOwnerSession } from '@/lib/auth/proxy';

export function proxy(request: NextRequest) {
  return updateDashboardOwnerSession(request);
}

export const config = {
  matcher: ['/:path*'],
};
