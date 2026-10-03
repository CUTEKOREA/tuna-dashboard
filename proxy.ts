import type { NextFetchEvent, NextRequest } from 'next/server';
import { updateDashboardOwnerSession } from '@/lib/auth/proxy';

export function proxy(request: NextRequest, event?: NextFetchEvent) {
  return updateDashboardOwnerSession(request, event);
}

export const config = {
  matcher: ['/:path*'],
};
