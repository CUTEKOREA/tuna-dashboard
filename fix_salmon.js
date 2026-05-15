const fs = require('fs');
const file = 'public/data/salmon_real_data_v4.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const KPIs = {
  kpi1: { telemetry: 'static', syncDate: '2024.11' },
  kpi2: { telemetry: 'static', syncDate: '2024.11' },
  kpi3: { telemetry: 'live', syncDate: '실시간 연동중' },
  kpi4: { telemetry: 'static', syncDate: '2024.01' },
  kpi5: { telemetry: 'static', syncDate: '2024.11' },
  kpi6: { telemetry: 'live', syncDate: '실시간 연동중' },
};

Object.keys(data.kpis).forEach(key => {
  if (KPIs[key]) {
    data.kpis[key].telemetry = KPIs[key].telemetry;
    data.kpis[key].syncDate = KPIs[key].syncDate;
  }
});

data.widgets.forEach(w => {
  if (w.title.includes('톤')) w.unit = '톤';
  else if (w.title.includes('%')) w.unit = '%';
  else if (w.title.includes('USD') || w.title.includes('$')) w.unit = 'USD';
  
  if (w.subtitle) {
    if (w.subtitle.includes('천 톤')) { w.yUnit = '천톤'; w.unit = '천톤'; }
    else if (w.subtitle.includes('백만$')) { w.yUnit = '백만$'; w.unit = '백만$'; }
    else if (w.subtitle.includes('USD/T') || w.subtitle.includes('단가')) { w.yUnit = 'USD/T'; w.unit = 'USD'; }
  } else if (w.lines || w.bars || w.areas) {
    const dKeys = [...(w.lines||[]), ...(w.bars||[]), ...(w.areas||[])].map(x => x.key || x.dataKey).join(' ');
    if (dKeys.includes('톤') || dKeys.includes('Tonnes')) { w.yUnit = '톤'; w.unit = '톤'; }
    else if (dKeys.includes('USD')) { w.yUnit = 'USD'; w.unit = 'USD'; }
    else if (dKeys.includes('%') || dKeys.includes('비중') || dKeys.includes('점유율') || dKeys.includes('성장')) { w.yUnit = '%'; w.unit = '%'; }
  }

  // Remove [KFAS 학술 근거], [Live 🟢], etc from title if present
  w.title = w.title.replace(/\[KFAS 학술 근거\]\s*/g, '').replace(/\[Live 🟢\]\s*/g, '').replace(/\[Live 🔴\]\s*/g, '').trim();

  // Remove w.sit, w.strat to standardize to w.situation and w.takeaway
  if (w.sit && !w.situation) w.situation = w.sit;
  if (w.strat && !w.takeaway) w.takeaway = w.strat;
  delete w.sit;
  delete w.strat;

  // Ensure source exists
  if (!w.source) w.source = "FAO FishStatJ + KFAS [연어 시장 동향 보고서 교차 검증]";
  else if (!w.source.includes('KFAS')) w.source = w.source + ' · KFAS';

  if (!w.subtitle) w.subtitle = "대서양 연어(Atlantic Salmon) 주요 지표 동향";
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed salmon_real_data_v4.json');
