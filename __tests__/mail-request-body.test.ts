import { describe, expect, it } from 'vitest';
import { readLimitedRequestText, RequestBodyTooLargeError } from '../lib/mail/request-body';

function chunkedRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  return new Request('https://leedonggun.co.kr/api/mail/gmail/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
}

describe('메일 요청 본문 스트리밍 제한', () => {
  it('Content-Length가 없는 chunked 요청을 상한 전에 중단한다', async () => {
    const request = chunkedRequest(['12345', '67890', 'extra']);
    await expect(readLimitedRequestText(request, 10)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });

  it('상한 이내의 UTF-8 chunk를 손실 없이 합친다', async () => {
    const request = chunkedRequest(['{"text":"', '한글', '"}']);
    await expect(readLimitedRequestText(request, 40)).resolves.toBe('{"text":"한글"}');
  });
});