/**
 * 「방콕사무소 > 가공사 조사」 탭의 새 절 렌더 가드.
 *
 * 로컬 production 화면을 눈으로 확인할 수 없어(접속 보안 미들웨어가 막는다) 이 테스트가 그 자리를 대신한다.
 * 1. 새 절이 태국·베트남 두 화면에 그려지고, 기존 절(Top Picks·Shortlist·전수표)을 지우지 않는다.
 * 2. 기존 전수표가 비운 두 칸(어종군·원료 원산지)이 표 머리에 실제로 나온다.
 * 3. 「두 표를 더하지 말라」·「한 줄로 묶었다」 경고가 화면 텍스트에 있다 — 건수가 어긋나는 이유다.
 * 4. 모회사·자회사가 갈려 그려진다(THAI UNION GROUP 3 / SEAFOOD 94).
 * 5. 조사보고서 대조 칸이 Top Pick·심층 프로파일을 실제로 표시한다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProcessorsTab } from '@/components/bangkok/tabs/ProcessorsTab';

/** 초기 선택국은 `seasiaCountries[0]`(태국)이다. 베트남 화면은 자료 단위로 따로 검사한다. */
function markup(): string {
  return renderToStaticMarkup(React.createElement(ProcessorsTab));
}

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');

describe('가공사 조사 탭 — 원장 절 렌더', () => {
  const html = markup();
  const text = strip(html);

  it('새 절 제목이 그려진다', () => {
    expect(text).toContain('어종·원료 원산지로 다시 본 제조소');
    expect(text).toContain('가공 제조소 상위 20');
    expect(text).toContain('제3국 원료를 쓰는 제조소');
  });

  it('기존 절을 지우지 않는다', () => {
    expect(text).toContain('주목 상위 후보');
    expect(text).toContain('인수 매력도 순위');
    expect(text).toContain('심층 프로파일');
    expect(text).toContain('한국 거래처 전수표');
  });

  it('기존 전수표가 비운 두 칸이 표 머리에 있다', () => {
    expect(text).toContain('어종군');
    expect(text).toContain('원료 원산지');
    expect(text).toContain('제3국 원료');
    expect(text).toContain('조사보고서 대조');
  });

  it('두 표를 섞지 말라는 경고가 화면에 있다', () => {
    expect(text).toContain('더하거나 덮지 않는다');
    expect(text).toContain('한 줄로 묶었다');
    expect(text).toContain('물량이 아니다');
  });

  it('태국 집계 숫자가 화면에 그대로 나온다', () => {
    expect(text).toContain('2,235');
    expect(text).toContain('37');
    // 제3국 원료 신고 건수
    expect(text).toContain('175');
  });

  it('모회사와 자회사가 갈려 그려진다', () => {
    expect(text).toContain('THAI UNION SEAFOOD COMPANY LIMITED');
    expect(text).toContain('THAI UNION GROUP PUBLIC COMPANY LIMITED');
    // 붙었으면 한 줄에 「+표기」가 달린다
    expect(/THAI UNION[^<]{0,40}\+표기/.test(html)).toBe(false);
  });

  it('조사보고서 대조 칸이 Top Pick·심층 프로파일을 표시한다', () => {
    expect(text).toContain('Top Pick');
    expect(text).toContain('전수표에 없음');
  });

  it('원장 상위 제조소 이름이 실제로 나온다', () => {
    expect(text).toContain('FISH MANAGER');
    expect(text).toContain('KF FOODS');
    expect(text).toContain('아르헨티나');
  });
});
