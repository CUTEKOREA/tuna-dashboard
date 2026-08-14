export const dynamic = 'force-dynamic';

const COSMO_DASHBOARD_URL = 'https://cosmo-dashboard-cutekorea-3280s-projects.vercel.app/';

export async function GET() {
  let available = false;

  try {
    const response = await fetch(COSMO_DASHBOARD_URL, {
      method: 'HEAD',
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(5_000),
    });
    available = response.ok;
  } catch {
    available = false;
  }

  return Response.json(
    { available },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
