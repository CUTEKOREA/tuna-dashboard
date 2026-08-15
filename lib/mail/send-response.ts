export function isUncertainMailSendResponse(status: number, code: unknown): boolean {
  if (status >= 500) return true;
  if (code === 'mail_send_status_unknown') return true;
  return status === 409 && code !== 'gmail_not_connected';
}
