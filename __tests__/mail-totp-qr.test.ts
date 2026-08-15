import { describe, expect, it } from 'vitest';
import { isSafeTotpQrDataUrl } from '../lib/mail/totp-qr';

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`;
}

describe('TOTP QR SVG 검증', () => {
  it('내부 도형만 포함한 제한 크기 SVG data URL을 허용한다', () => {
    expect(isSafeTotpQrDataUrl(svgDataUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M0 0h1v1H0z"/></svg>',
    ))).toBe(true);
    expect(isSafeTotpQrDataUrl(svgDataUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2" style="fill:#fff"/><path d="M0 0h1v1H0z" style="fill:#000"/></svg>',
    ))).toBe(true);
  });

  it('스크립트·이벤트 핸들러·외부 참조·비 SVG·과대 응답을 거부한다', () => {
    for (const value of [
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/x"/></svg>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:url(https://evil.example/x)"/></svg>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><animate attributeName="opacity"/></svg>'),
      svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><set attributeName="opacity"/></svg>'),
      'data:text/html,<script>alert(1)</script>',
      `data:image/svg+xml;utf-8,${'a'.repeat(100_001)}`,
    ]) {
      expect(isSafeTotpQrDataUrl(value)).toBe(false);
    }
  });

  it('잘못된 percent encoding과 XML entity 선언을 거부한다', () => {
    expect(isSafeTotpQrDataUrl('data:image/svg+xml;utf-8,%E0%A4%A')).toBe(false);
    expect(isSafeTotpQrDataUrl(svgDataUrl(
      '<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>',
    ))).toBe(false);
  });
});
