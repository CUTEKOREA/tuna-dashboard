import { getMiscData } from '@/lib/data/misc';

const shrimpData = getMiscData('shrimpDashboard');
const d: any = shrimpData;

export const tC = (n: string) => {
  const map: Record<string, string> = {
    'China': '중국', 'Ecuador': '에콰도르', 'India': '인도',
    'Indonesia': '인도네시아', 'Viet Nam': '베트남', 'Vietnam': '베트남', 'Thailand': '태국',
    'Argentina': '아르헨티나', 'United States of America': '미국',
    'Japan': '일본', 'Korea, Republic of': '대한민국', 'Republic of Korea': '대한민국',
    'Spain': '스페인', 'France': '프랑스',
    'Canada': '캐나다', 'Mexico': '멕시코', 'Brazil': '브라질',
    'Bangladesh': '방글라데시', 'Myanmar': '미얀마', 'Philippines': '필리핀',
    'Denmark': '덴마크', 'Netherlands (Kingdom of the)': '네덜란드',
    'Belgium': '벨기에', 'Saudi Arabia': '사우디', 'Malaysia': '말레이시아',
    'Cameroon': '카메룬', 'Greenland': '그린란드', 'Italy': '이탈리아',
    'Germany': '독일', 'Russian Federation': '러시아', 'United Kingdom of Great Britain and Northern Ireland': '영국',
    'Venezuela (Bolivarian Republic of)': '베네수엘라', 'Totals - Tonnes - live weight': '합계',
  };
  return map[n] || n;
};

// ==========================================
// TAB 1 Data
// ==========================================
export const megatrendData = (d.production_total?.timeline || []).filter((t: any) => t.year >= 1970);

const captureMap = new Map((d.capture?.timeline || []).map((t: any) => [t.year, t.value]));
const aquaMap = new Map((d.aquaculture?.timeline || []).map((t: any) => [t.year, t.value]));
export const capVsAquaData = megatrendData.map((t: any) => ({
  year: t.year,
  capture: captureMap.get(t.year) || 0,
  aquaculture: aquaMap.get(t.year) || 0,
}));

export const aquaShareData = capVsAquaData.filter((d: any) => d.year >= 1980).map((t: any) => ({
  year: t.year,
  share: t.capture + t.aquaculture > 0 ? Math.round((t.aquaculture / (t.capture + t.aquaculture)) * 1000) / 10 : 0,
}));

export const aquaValueTimeline = (d.aquaculture_value?.timeline || []).filter((t: any) => t.year >= 1984);
export const top10Prod = (d.production_total?.top10 || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const top10Aqua = (d.aquaculture?.top10 || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const top10Cap = (d.capture?.top10 || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const top10AquaVal = (d.aquaculture_value?.top10 || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const captureCeiling = (d.capture?.timeline || []).filter((t: any) => t.year >= 1970);
export const totalProd = d.production_total?.latest_value || 19129390;
export const hhi = top10Prod.reduce((sum: number, c: any) => sum + Math.pow((c.value / totalProd) * 100, 2), 0);

// ==========================================
// TAB 2 Data
// ==========================================
const tradeExpQty = (d.trade_recent?.export_qty_timeline || []).filter((t: any) => t.year >= 1976);
const tradeImpQty = (d.trade_recent?.import_qty_timeline || []).filter((t: any) => t.year >= 1976);
const tradeExpUsd = (d.trade_recent?.export_usd_timeline || []).filter((t: any) => t.year >= 1976);
const tradeImpUsd = (d.trade_recent?.import_usd_timeline || []).filter((t: any) => t.year >= 1976);

export const tradeQtyMerged = tradeExpQty.map((e: any) => {
  const imp = tradeImpQty.find((i: any) => i.year === e.year);
  return { year: e.year, export: e.value, import: imp?.value || 0 };
});
export const tradeUsdMerged = tradeExpUsd.map((e: any) => {
  const imp = tradeImpUsd.find((i: any) => i.year === e.year);
  return { year: e.year, export: e.value, import: imp?.value || 0 };
});

export const recent5yr = (d.trade_long?.export_qty_timeline || []).map((e: any) => ({
  year: e.year,
  exportQty: e.value,
  importQty: (d.trade_long?.import_qty_timeline || []).find((i: any) => i.year === e.year)?.value || 0,
  exportUsd: (d.trade_long?.export_usd_timeline || []).find((i: any) => i.year === e.year)?.value || 0,
  importUsd: (d.trade_long?.import_usd_timeline || []).find((i: any) => i.year === e.year)?.value || 0,
}));

export const topExportersQty = (d.trade_recent?.top_exporters_qty || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const topImportersQty = (d.trade_recent?.top_importers_qty || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const topExportersUsd = (d.trade_recent?.top_exporters_usd || []).map((x: any) => ({ ...x, country: tC(x.country) }));
export const topImportersUsd = (d.trade_recent?.top_importers_usd || []).map((x: any) => ({ ...x, country: tC(x.country) }));

export const tradeBalanceCountry = topExportersUsd.map((exp: any) => {
  const impEntry = topImportersUsd.find((i: any) => i.country === exp.country);
  return { country: exp.country, surplus: exp.value - (impEntry?.value || 0) };
}).sort((a: any, b: any) => b.surplus - a.surplus);

export const cagr1976 = tradeExpQty.length >= 2 ? Math.round((Math.pow(tradeExpQty[tradeExpQty.length - 1].value / tradeExpQty[0].value, 1 / (tradeExpQty[tradeExpQty.length - 1].year - tradeExpQty[0].year)) - 1) * 1000) / 10 : 0;

// ==========================================
// TAB 3 Data
// ==========================================
export const koreaData = d.korea || {};
export const koreaSelfSufficiency = koreaData.production > 0 && koreaData.import_qty > 0
  ? Math.round((koreaData.production / (koreaData.production + koreaData.import_qty)) * 1000) / 10
  : 0;
export const koreaImportTimeline = (koreaData.import_timeline || []).filter((t: any) => t.year >= 1994);

export const unitPriceExport = topExportersQty.map((eq: any) => {
  const usdEntry = topExportersUsd.find((u: any) => u.country === eq.country);
  return {
    country: eq.country,
    volume: eq.value,
    price: usdEntry && eq.value > 0 ? Math.round((usdEntry.value * 1000) / eq.value) : 0,
  };
}).filter((x: any) => x.price > 0);

// ==========================================
// TAB 4 & 5 Data
// ==========================================
export const processedTimeline = (d.processed?.timeline || []).filter((t: any) => t.year >= 1976);
export const top10Processed = (d.processed?.top10 || []).map((x: any) => ({ ...x, country: tC(x.country) }));

export const processingRatio = top10Processed.map((p: any) => {
  const prodEntry = top10Prod.find((pr: any) => pr.country === p.country);
  return {
    country: p.country,
    ratio: prodEntry && prodEntry.value > 0 ? Math.round((p.value / prodEntry.value) * 1000) / 10 : 0,
    processed: p.value,
    production: prodEntry?.value || 0,
  };
}).sort((a: any, b: any) => b.ratio - a.ratio);

export const aquaValuePerTon = top10AquaVal.map((av: any) => {
  const aq = top10Aqua.find((a: any) => a.country === av.country);
  return {
    country: av.country,
    valuePerTon: aq && aq.value > 0 ? Math.round((av.value * 1000) / aq.value) : 0,
  };
}).filter((x: any) => x.valuePerTon > 0).sort((a: any, b: any) => b.valuePerTon - a.valuePerTon);

export const unitPriceTimeline = tradeExpUsd.filter((e: any) => e.year >= 1990).map((e: any) => {
  const qty = tradeExpQty.find((q: any) => q.year === e.year);
  return {
    year: e.year,
    unitPrice: qty && qty.value > 0 ? Math.round((e.value * 1000) / qty.value) : 0,
  };
}).filter((x: any) => x.unitPrice > 0);
