import { NextResponse } from 'next/server';

const DART_API_KEY = process.env.DART_API_KEY;

const COMPANIES = [
  { name: '신라교역', ticker: '004970', corp_code: '00135962' },
  { name: '신라에스지', ticker: '025870', corp_code: '00136004' },
  { name: '원일특강', ticker: '012620', corp_code: '00143907' },
];

function generateInsight(name: string, q1Rev: number, yoyRev: number, q1Op: number, prevOp: number, opm: number, nim: number, debtRatio: number) {
  let text = `[Investment Committee Memorandum]\n\n**1. Top-line & Market Position**\n`;
  if (yoyRev > 10) text += `전년 동기 대비 ${yoyRev.toFixed(1)}% 급증한 Top-line 성장으로 시장 지배력 확대. `;
  else if (yoyRev > 0) text += `매크로 불확실성 속에서도 전년 대비 ${yoyRev.toFixed(1)}% 수준의 외형 방어 성공. `;
  else text += `수요 둔화 직격탄으로 Top-line ${Math.abs(yoyRev).toFixed(1)}% 역성장. 외형 회복을 위한 턴어라운드 전략 시급. `;

  text += `\n\n**2. Profitability & Margin Profile**\n`;
  if (prevOp < 0 && q1Op > 0) {
    text += `가장 고무적인 부분은 영업이익 ${(q1Op/100000000).toFixed(0)}억 시현을 통한 흑자전환(Turnaround). 체질 개선(Value Creation) 효과가 가시화됨. `;
  } else if (q1Op < 0) {
    text += `영업적자 발생으로 Bottom-line 훼손. Margin Squeeze 방어를 위한 즉각적인 Cost-cutting 실행 및 적자 사업부 구조조정(Carve-out) 필요. `;
  } else {
    const yoyOp = ((q1Op - prevOp) / Math.abs(prevOp)) * 100;
    if (yoyOp > 20) text += `영업이익이 ${yoyOp.toFixed(1)}% 급증하며 강력한 이익 창출력(Cash-cow) 입증. `;
    else if (yoyOp > 0) text += `영업이익 ${yoyOp.toFixed(1)}% 성장하며 견조한 이익 체력 증명. `;
    else text += `영업이익 ${Math.abs(yoyOp).toFixed(1)}% 하락. 원가 구조 훼손 및 판관비 부담 가중으로 마진 압박(Margin Squeeze) 심화. `;
  }

  text += `최종 OPM은 ${opm.toFixed(1)}%, NIM은 ${nim.toFixed(1)}% 수준을 기록함. `;

  text += `\n\n**3. Capital Structure & Leverage**\n`;
  if (debtRatio > 200) text += `현재 부채비율 ${debtRatio.toFixed(1)}%로 재무 레버리지 리스크(High Leverage) 노출. 리파이낸싱 리스크 점검 및 De-leveraging 우선 고려 요망.`;
  else if (debtRatio > 100) text += `부채비율 ${debtRatio.toFixed(1)}%로 적정 수준의 자본 구조(Capital Structure) 유지 중.`;
  else text += `부채비율 ${debtRatio.toFixed(1)}% 수준의 우량한 재무건전성(Under-leveraged) 확보. M&A 등 Inorganic Growth를 위한 드라이파우더(Dry-powder) 여력 충분.`;

  return text;
}

export async function GET() {
  if (!DART_API_KEY) {
    return NextResponse.json({ error: 'DART API key is not configured.' }, { status: 500 });
  }

  try {
    const bsns_year = '2025';
    const reprt_code = '11011'; // FY

    const results = [];

    for (const company of COMPANIES) {
      const url = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${DART_API_KEY}&corp_code=${company.corp_code}&bsns_year=${bsns_year}&reprt_code=${reprt_code}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();

      if (data.status !== '000') {
        results.push({ name: company.name, ticker: company.ticker, error: true, insight: `[DART API 오류] ${data.message}` });
        continue;
      }

      // STRICTLY CFS (연결재무제표)
      let cfsList = data.list.filter((i: any) => i.fs_div === 'CFS');

      if (cfsList.length === 0) {
        results.push({ name: company.name, ticker: company.ticker, error: true, insight: '연결재무제표(CFS) 데이터를 찾을 수 없습니다.' });
        continue;
      }

      const parseDartAmount = (val: string) => parseInt(val?.replace(/,/g, '') || '0', 10);

      // Extract IS (Income Statement)
      const revItem = cfsList.find((i: any) => i.account_nm.includes('매출') && i.sj_div === 'IS');
      const opItem = cfsList.find((i: any) => i.account_nm.includes('영업이익') && i.sj_div === 'IS');
      const niItem = cfsList.find((i: any) => i.account_nm.includes('당기순이익') && (i.sj_div === 'IS' || i.sj_div === 'CIS'));

      // Extract BS (Balance Sheet)
      const assetItem = cfsList.find((i: any) => i.account_nm === '자산총계' && i.sj_div === 'BS');
      const liabItem = cfsList.find((i: any) => i.account_nm === '부채총계' && i.sj_div === 'BS');
      const eqItem = cfsList.find((i: any) => i.account_nm === '자본총계' && i.sj_div === 'BS');

      if (!revItem || !opItem || !assetItem || !liabItem || !eqItem) {
        results.push({ name: company.name, ticker: company.ticker, error: true, insight: '핵심 재무항목(매출/영업이익/자산/부채)이 누락되었습니다.' });
        continue;
      }

      const q1Rev = parseDartAmount(revItem.thstrm_amount);
      const prevRev = parseDartAmount(revItem.frmtrm_amount);
      const q1Op = parseDartAmount(opItem.thstrm_amount);
      const prevOp = parseDartAmount(opItem.frmtrm_amount);
      const netIncome = niItem ? parseDartAmount(niItem.thstrm_amount) : 0;

      const totalAssets = parseDartAmount(assetItem.thstrm_amount);
      const totalLiab = parseDartAmount(liabItem.thstrm_amount);
      const totalEq = parseDartAmount(eqItem.thstrm_amount);

      const q1RevBillion = +(q1Rev / 100000000).toFixed(1);
      const q1OpBillion = +(q1Op / 100000000).toFixed(1);
      const niBillion = +(netIncome / 100000000).toFixed(1);
      const assetBillion = +(totalAssets / 100000000).toFixed(0);
      const liabBillion = +(totalLiab / 100000000).toFixed(0);
      const eqBillion = +(totalEq / 100000000).toFixed(0);
      
      const yoyRev = prevRev !== 0 ? ((q1Rev - prevRev) / prevRev) * 100 : 0;
      let yoyOp = null;
      if (prevOp > 0 && q1Op > 0) yoyOp = ((q1Op - prevOp) / prevOp) * 100;
      else if (prevOp < 0 && q1Op < 0) yoyOp = -((q1Op - prevOp) / Math.abs(prevOp)) * 100;
      else if (prevOp !== 0 && q1Op !== 0) yoyOp = ((q1Op - prevOp) / Math.abs(prevOp)) * 100;
      
      const opm = q1Rev !== 0 ? (q1Op / q1Rev) * 100 : 0;
      const nim = q1Rev !== 0 ? (netIncome / q1Rev) * 100 : 0;
      const debtRatio = totalEq !== 0 ? (totalLiab / totalEq) * 100 : 0;

      const insight = generateInsight(company.name, q1Rev, yoyRev, q1Op, prevOp, opm, nim, debtRatio);

      results.push({
        name: company.name,
        ticker: company.ticker,
        q1_revenue: q1RevBillion,
        yoy_revenue: +yoyRev.toFixed(1),
        q1_op: q1OpBillion,
        yoy_op: yoyOp !== null ? +yoyOp.toFixed(1) : null,
        net_income: niBillion,
        total_assets: assetBillion,
        total_liab: liabBillion,
        total_equity: eqBillion,
        opm: +opm.toFixed(2),
        nim: +nim.toFixed(2),
        debt_ratio: +debtRatio.toFixed(1),
        insight
      });
    }

    return NextResponse.json({ companies: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
