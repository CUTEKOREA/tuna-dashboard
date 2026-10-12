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
  it('5건을 싣고 9/20 까지는 MGO 로 짝지은 주간동향과 값이 같다', () => {
    expect(atlanticMails.map((m) => m.date)).toEqual(['2026-08-30', '2026-09-06', '2026-09-13', '2026-09-20', '2026-10-11']);
    for (const mail of atlanticMails.filter((m) => m.date <= '2026-09-20')) {
      const weekly = weeks.find((w) => w.reportDate === mail.weeklyPair)!;
      expect(weekly, mail.weeklyPair).toBeDefined();
      expect(mail.mgo.tema).toBe(weekly.fuel.tema);
      if (mail.mgo.tanker != null) expect(mail.mgo.tanker).toBe(weekly.fuel.tanker);
      if (mail.mgo.abidjan != null) expect(mail.mgo.abidjan).toBe(weekly.fuel.abidjan);
    }
    // 10/11 메일 MGO 는 10/6 주간동향(테마 1,678 · 탱커 1,535)을 옮기지 않고 따로 적었다(테마는 «$1,660 이상»)
    const oct11 = latestAtlanticMail;
    expect(oct11.weeklyPair).toBe('2026-10-06');
    const oct06 = weeks.find((w) => w.reportDate === '2026-10-06')!;
    expect([oct06.fuel.tema, oct06.fuel.tanker]).toEqual([1_678, 1_535]);
    expect(oct11.mgo).toMatchObject({ tema: 1_660, tanker: 1_573, abidjan: null, dakar: 1_340 });
    expect(oct11.scasa).toEqual({ priceUsd: 1_950, dailyProcessingT: 120 });
    expect(oct11.cosmo).toMatchObject({ priceUsd: 1_850, priceMonth: '9월', dailyProcessingT: 100 });
    // 원문 «원어 : 1,250톤» - 어종 구분이 없다
    expect(oct11.cosmo.stock).toEqual({ asOf: '2026-10-11', totalT: 1_250, sjT: null, yfT: null, mixT: null });
    expect(oct11.pfc).toEqual({ priceUsd: null, note: '10월 거래 없음(어가 소폭 하락 예상)' });
    // 그랑블루 판매·운임이 없다 - 빈 값을 지난주 값으로 채우지 않는다
    expect(oct11.grandBleuSales).toEqual([]);
    expect(oct11.freightUsdPerT).toBeNull();
    const sep20 = atlanticMails.find((m) => m.date === '2026-09-20')!;
    expect(sep20.pfc).toEqual({ priceUsd: null, note: null });
    // 9/13 메일의 재고는 SJ 만 적혔다 - YF·MIX 는 0 이 아니라 미기재
    const sep13 = atlanticMails.find((m) => m.date === '2026-09-13')!;
    expect(sep13.cosmo.stock).toMatchObject({ totalT: 3_725, sjT: 3_725, yfT: null, mixT: null });
    expect(sep13.grandBleuSales.map((g) => g.priceUsd)).toEqual([2_000, 2_050]);
    // 9/20 재고는 3,160톤(SJ 3,130 · YF 30) - 9/11 대비 565톤 줄었다
    expect(sep20.cosmo.stock).toMatchObject({ asOf: '2026-09-20', totalT: 3_160, sjT: 3_130, yfT: 30, mixT: null });
    // 9월은 거래가 없었다 - 협의 중이 아니라 재고 때문에 10월 중순 이후를 원한다는 뜻
    expect(sep20.cosmo.nextMonthUnderNegotiation).toBe(false);
  });

  it('사람 이름·메일 주소·좌표를 싣지 않는다', () => {
    const text = JSON.stringify(atlanticMails);
    expect(text).not.toContain('@');
    expect(text).not.toContain('→');
    expect(text).not.toMatch(/Mr\.?\s/);
    expect(text).not.toMatch(/\([가-힣]{2,3}\s*(선장|기관장)\)/);
    expect(text).not.toMatch(/[가-힣]{3}\s*(사장|법인장|팀장)/);
    expect(text).not.toMatch(/[NS]\d{2,4}\s*[EW]\d{3,5}/);
    expect(text).not.toMatch(/\b[NSWE]\d{2,3}\b/);
    // 10/11 원문의 선장 교대·체항 사유에 실명이 있다 - 직함으로만 옮겼는지 본다
    expect(text).not.toMatch(/[가-힣]{3}\s*선장\s*(승선|인수인계|\))/);
    expect(text).toContain('신임 선장 승선');
  });

  it('주간동향과 어긋나는 가공량·출항을 파생한다', () => {
    expect(mailProcessingVsWeekly.map((r) => [r.cosmoWeekly, r.cosmoMail])).toEqual([[80, 85], [80, 90], [80, 95], [95, 100], [100, 100]]);
    // 10/11 메일 PFC 메모는 어가(「10월 거래 없음」)라 가공량 대조에 넣지 않는다
    expect(mailProcessingVsWeekly.map((r) => r.pfcMailNote)).toEqual(['원어 부족(0톤)으로 금주 가공 중단', null, null, null, null]);
    expect(mailProcessingVsWeekly[0]).toMatchObject({ pfcWeekly: 90, pfcMailNote: '원어 부족(0톤)으로 금주 가공 중단' });
    // 8/30 메일은 SEA DEFENDER 하역 중, 9/1 주간동향은 8/29 출항 완료. 같은 날 출항(XIXILI 9/6)은 어긋남이 아니다.
    expect(mailDepartureConflicts).toEqual([
      { vessel: 'SEA DEFENDER', mailLabel: '8/30', mailStatus: '하역 중', weeklyLabel: '9/1', weeklyDepart: '8/29' },
    ]);
  });

  it('/panofi 어가·선단 탭에 메일 값을 렌더한다', () => {
    const price = renderToStaticMarkup(React.createElement(PriceTab));
    expect(price).toContain('주말 메일 5건 - 주간동향에 없는 값');
    expect(price).toContain('10/11 메일은 테마 $1,660(10/6 주간동향 $1,678)로 따로 적었다');
    expect(price).not.toContain('메일마다 직전 주간동향 값을 그대로 옮긴다');
    expect(price).not.toContain('10월 거래 없음(어가 소폭 하락 예상)」이다');
    expect(price).toContain('스카사 어가가 $1,800에서 $1,950으로 올라');
    expect(price).toContain('9/1 주간동향 코스모 80톤 대 9/6 메일 90톤');
    expect(price).toContain('9/15 주간동향 코스모 95톤 대 9/20 메일 100톤');
    /* 9/15 주간동향이 80 → 95 로 움직이면서 「주간동향은 같은 값을 이어 적는다」는 더 이상 사실이 아니다.
     * 그 문장은 조건부로 붙게 돼 있어 저절로 빠진다 - 빠졌는지까지 본다. */
    expect(price).not.toContain('주간동향은 같은 값을 이어 적고 메일만 움직인다.');
    const fleet = renderToStaticMarkup(React.createElement(FleetTab));
    // 선단 탭 세네갈 입출항은 주말 메일과 주간동향 중 더 최신인 쪽을 싣는다.
    // 10/11 메일이 10/6 주간동향보다 최신이라 메일 표(COSMOS KIM 체항 등)가 나와야 한다.
    expect(fleet).toContain('주말 메일 10/11 · 톤');
    expect(fleet).toContain('국적 증서 문제로 약 50일 체항 중');
    expect(fleet).not.toContain('ALBONIGA');
    expect(fleet).toContain('P/FORE 10/11 신임 선장 승선');
    expect(fleet).toContain('SEA DEFENDER - 8/30 메일은 「하역 중」인데 9/1 주간동향은 8/29 출항 완료로 적었다.');
  });
});

describe('코스모 원장 대 PANOFI 메일', () => {
  it('주차 말일이 같은 주만 짝짓고 재고 차이를 파생한다', () => {
    // 38주차 원장이 들어오며 9/20 메일도 짝이 맞았다. 10/11 메일(41주차 말일)은 원장이 40주차까지라 짝이 없다
    expect(cosmoMailRows.map((r) => r.week)).toEqual([35, 36, 37, 38, null]);
    expect(cosmoMailRows[0].ledgerDailyT).toBeCloseTo(85.1, 1);
    expect(cosmoMailRows[1].ledgerDailyT).toBeCloseTo(86.2, 1);
    expect(cosmoMailRows[2].ledgerDailyT).toBeCloseTo(97.1, 1);
    expect(cosmoMailRows[0].stockGapT).toBeCloseTo(-250.6, 1);
    expect(cosmoMailRows[1].stockGapT).toBeCloseTo(-525.6, 1);
    // 메일 9/11 기준 3,725 MT 대 원장 9/13 잔량 3,792.6 MT - 기준일이 이틀 다르다
    expect(cosmoMailRows[2].stockGapT).toBeCloseTo(-67.6, 1);
    // 9/20 메일 대 38주차 원장: 일평균 103.1 MT, 재고 차이 -99.2 MT
    expect(cosmoMailRows[3].ledgerDailyT).toBeCloseTo(103.1, 1);
    expect(cosmoMailRows[3].stockGapT).toBeCloseTo(-99.2, 1);
    expect(cosmoMailRows.map((r) => r.inflowResidualT)).toEqual([null, 260.66, null, null, null]);
  });

  it('원어 입고·구매 물량 검산은 36·39주차에서만 깨진다', () => {
    const inflow = checks.filter((c) => c.name === '원어 입고·구매 물량');
    expect(inflow).toHaveLength(meta.weekCount);
    expect(inflow.filter((c) => !c.ok)).toEqual([
      { week: 36, name: '원어 입고·구매 물량', residual: 260.66, ok: false, note: '재고 PS 원어 입고−구매 (MT)' },
      // 39주차: 구매 시트는 구매 0인데 재고현황 YF/BE 입고 30.225 MT
      { week: 39, name: '원어 입고·구매 물량', residual: 30.23, ok: false, note: '재고 PS 원어 입고−구매 (MT)' },
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
    expect(markup).toContain('원어 입고·구매 대조는 <b>36주차 260.66 MT, 39주차 30.23 MT</b> 어긋납니다');
    // 데이터 이슈 표가 「36주차만」이라고 남으면 39주차 불일치와 모순된다
    expect(markup).not.toContain('36주차만 260.66 MT');
    expect(markup).not.toMatch(/260\.66 MT[^<]*<\/b>로 반올림 수준/);
    // 생산일수 브릿지 잔차는 일 단위다 - «4.00 MT» 로 찍히던 표기 오류
    expect(markup).toContain('13주차 CBU 생산일수 누적 브릿지 4.00일');
    expect(markup).not.toMatch(/생산일수 누적 브릿지 -?\d+\.\d{2} MT/);
  });
});
