export function hasTrustedMailOrigin(
  request: Request,
  publicBaseUrl: string,
): boolean {
  const origin = request.headers.get('origin');
  if (!origin || !publicBaseUrl.trim()) return false;
  try {
    return new URL(origin).origin === new URL(publicBaseUrl).origin;
  } catch {
    return false;
  }
}