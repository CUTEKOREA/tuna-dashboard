import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FleetTab, PriceTab } from '../components/panofi/PanofiTabs';
import Quality from '../components/cosmo/tabs/QualityTab';
import { checks, meta } from '../lib/data/cosmo';
import { cosmoMailRows } from '../lib/data/cosmo-panofi-mail';
import { mailDepartureConflicts, mailProcessingVsWeekly, weeks } from '../lib/data/panofi';
import { atlanticMails, latestAtlanticMail } from '../lib/data/panofi-atlantic-mail';

describe('PANOFI 대서양 주말 메일', () => {
  it('3건을 싣고 MGO 로 짝지은 주간동향과 값이 같다', () => {
    expect(atlanticMails.map((m) => m.date)).toEqual(['2026-08-30', '2026-09-06', '2026-09-13']);
    for (const mail of atlanticMails) {
      const weekly = weeks.find((w) => w.reportDate === mail.weeklyPair)!;
      expect(weekly, mail.weeklyPair).toBeDefined();
      expect(mail.mgo.tema).toBe(weekly.fuel.tema);
      if (mail.mgo.tanker != null) expect(mail.mgo.tanker).toBe(weekly.fuel.tanker);
      if (mail.mgo.abidjan != null) expect(mail.mgo.abidjan).toBe(weekly.fuel.abidjan);
    }
    expect(latestAtlanticMail.scasa.priceUsd).toBe(1_950);
    expect(latestAtlanticMail.grandBleuSales.map((g) => g.priceUsd)).toEqual([2_000, 2_050]);
    // 9/11 재고는 SJ 만 적혔다 - YF·MIX 는 0 이 아니라 미기재
    expect(latestAtlanticMail.cosmo.stock).toMatchObject({ totalT: 3_725, sjT: 3_725, yfT: null, mixT: null });
  });

  it('사람 이름·메일 주소·좌표를 싣지 않는다', () => {
    const text = JSON.stringify(atlanticMails);
    expect(text).not.toContain('@');
    expect(text).not.toContain('→');
    expect(text).not.toMatch(/Mr\.?\s/);
    expect(text).not.toMatch(/\([가-힣]{2,3}\s*(선장|기관장)\)/);
    expect(text).not.toMatch(/[가-힣]{3}\s*(사장|법인장|팀장)/);
    expect(text).not.toMatch(/[NS]\d{2,4}\s*[EW]\d{3,5}/);
  });

  it('주간동향과 어긋나는 가공량·출항을 파생한다', () => {
    expect(mailProcessingVsWeekly.map((r) => [r.cosmoWeekly, r.cosmoMail])).toEqual([[80, 85], [80, 90], [80, 95]]);
    expect(mailProcessingVsWeekly[0]).toMatchObject({ pfcWeekly: 90, pfcMailNote: '원어 부족(0톤)으로 금주 가공 중단' });
    // 8/30 메일은 SEA DEFENDER 하역 중, 9/1 주간동향은 8/29 출항 완료. 같은 날 출항(XIXILI 9/6)은 어긋남이 아니다.
    expect(mailDepartureConflicts).toEqual([
      { vessel: 'SEA DEFENDER', mailLabel: '8/30', mailStatus: '하역 중', weeklyLabel: '9/1', weeklyDepart: '8/29' },
    ]);
  });

  it('/panofi 어가·선단 탭에 메일 값을 렌더한다', () => {
    const price = renderToStaticMarkup(React.createElement(PriceTab));
    expect(price).toContain('주말 메일 3건 - 주간동향에 없는 값');
    expect(price).toContain('스카사 어가가 $1,800에서 $1,950로 올라');
    expect(price).toContain('9/1 주간동향 코스모 80톤 대 9/6 메일 90톤');
    expect(price).toContain('주간동향은 같은 값을 이어 적고 메일만 움직인다.');
    const fleet = renderToStaticMarkup(React.createElement(FleetTab));
    expect(fleet).toContain('PONT SAINT LOUIS');
    expect(fleet).toContain('SEA DEFENDER - 8/30 메일은 「하역 중」인데 9/1 주간동향은 8/29 출항 완료로 적었다.');
  });
});

describe('코스모 원장 대 PANOFI 메일', () => {
  it('주차 말일이 같은 주만 짝짓고 재고 차이를 파생한다', () => {
    expect(cosmoMailRows.map((r) => r.week)).toEqual([35, 36, null]);
    expect(cosmoMailRows[0].ledgerDailyT).toBeCloseTo(85.1, 1);
    expect(cosmoMailRows[1].ledgerDailyT).toBeCloseTo(86.2, 1);
    expect(cosmoMailRows[0].stockGapT).toBeCloseTo(-250.6, 1);
    expect(cosmoMailRows[1].stockGapT).toBeCloseTo(-525.6, 1);
    expect(cosmoMailRows.map((r) => r.inflowResidualT)).toEqual([null, 260.66, null]);
  });

  it('원어 입고·구매 물량 검산은 36주차에서만 깨진다', () => {
    const inflow = checks.filter((c) => c.name === '원어 입고·구매 물량');
    expect(inflow).toHaveLength(meta.weekCount);
    expect(inflow.filter((c) => !c.ok)).toEqual([
      { week: 36, name: '원어 입고·구매 물량', residual: 260.66, ok: false, note: '재고 PS 원어 입고−구매 (MT)' },
    ]);
    expect(meta.checkCount).toBe(checks.length);
    expect(meta.checkFailCount).toBe(checks.filter((c) => !c.ok).length);
  });

  it('데이터 품질 탭이 대조표와 새 검산을 MT 로 보여준다', () => {
    const markup = renderToStaticMarkup(React.createElement(Quality));
    expect(markup).toContain('코스모 일 가공·원어 재고 - 메일 대 원장');
    expect(markup).toContain('36주차는 원장 재고현황 SJ 입고가 구매 시트보다 260.66톤 많게 적혀');
    expect(markup).toContain('260.66 MT');
    // 생산 브릿지의 «반올림 수준» 문장에 물량 검산 260.66 이 섞이지 않는다
    expect(markup).toContain('원어 입고·구매 대조는 <b>36주차 260.66 MT</b> 어긋납니다');
    expect(markup).not.toMatch(/260\.66 MT[^<]*<\/b>로 반올림 수준/);
    // 생산일수 브릿지 잔차는 일 단위다 - «4.00 MT» 로 찍히던 표기 오류
    expect(markup).toContain('13주차 CBU 생산일수 누적 브릿지 4.00일');
    expect(markup).not.toMatch(/생산일수 누적 브릿지 -?\d+\.\d{2} MT/);
  });
});
