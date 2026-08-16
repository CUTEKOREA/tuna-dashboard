import { describe, expect, it } from 'vitest';

import { resolveLoginReturnPath } from '@/app/mail/login/page';

describe('protected dashboard login return path', () => {
  it('allows only exact internal protected paths', () => {
    expect(resolveLoginReturnPath('/fleet')).toBe('/fleet');
    expect(resolveLoginReturnPath('/mail')).toBe('/mail');
    expect(resolveLoginReturnPath(['/fleet', '/mail'])).toBe('/fleet');
    expect(resolveLoginReturnPath('https://example.com')).toBe('/mail');
    expect(resolveLoginReturnPath('//example.com')).toBe('/mail');
    expect(resolveLoginReturnPath('/fleet?admin=1')).toBe('/mail');
    expect(resolveLoginReturnPath(undefined)).toBe('/mail');
  });
});
