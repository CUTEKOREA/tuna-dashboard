const fs = require('fs');

const path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/SquidDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Refactor SECTIONS to 5 pillars and use Purple -> Pink palette
const newSectionsCode = `const SECTIONS = [
  { id: 'S1', title: '🌊 Part I — 원물 및 조달 (Raw Material)', desc: '포클랜드 자원평가 · 어획 헤게모니 · 기후 및 어획량 동향', color: '#8b5cf6' },
  { id: 'S2', title: '🏭 Part II — 가공 및 밸류체인 (Processing)', desc: '스페인(Vigo) 가공 허브 스프레드 · 대체 원료 블렌딩 마진 분석', color: '#a855f7' },
  { id: 'S3', title: '⚓ Part III — 물류 및 운영 원가 (Logistics)', desc: '라이선스/ITQ 입어료 비용 변동 · 채낚기 선단 유류비(MGO) 시뮬레이션', color: '#d946ef' },
  { id: 'S4', title: '📊 Part IV — 판매 및 수요 (Sales & Demand)', desc: 'KOSIS 내수 CPI 괴리율 · 인플레이션 발 수요 파괴 및 수입 단가 트렌드', color: '#ec4899' },
  { id: 'S5', title: '🛡️ Part V — ESG 및 미래 어업 (Sustainability)', desc: '남서대서양 IUU 레이더 · M&A 실사(PEF Valuation) 및 Earn-out 시뮬레이션', color: '#f43f5e' }
];`;

content = content.replace(/const SECTIONS = \[\s*\{[\s\S]*?\}\s*\];/g, newSectionsCode);
content = content.replace(/const SECTIONS = \[\s*\{[\s\S]*?\}\s*,\s*\];/g, newSectionsCode); // fallback
content = content.replace(/const SECTIONS = \[[\s\S]*?\];/, newSectionsCode);


// 2. Refactor KPI Themes
const newKpiThemes = `const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#8b5cf6', icon: Database },
  { border: 'none', glow: 'none', text: '#a855f7', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#d946ef', icon: Ship },
  { border: 'none', glow: 'none', text: '#ec4899', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: '#f43f5e', icon: Factory },
  { border: 'none', glow: 'none', text: '#fb7185', icon: Scale },
];`;
content = content.replace(/const KPI_THEMES = \[[\s\S]*?\];/, newKpiThemes);

// 3. PIE Colors
const newPieColors = `const PIE_COLORS = ["#8b5cf6", "#a855f7", "#d946ef", "#e879f9", "#ec4899", "#f43f5e", "#fb7185", "#fda4af"];`;
content = content.replace(/const PIE_COLORS = \[.*?\];/, newPieColors);

// 4. Update the layout: distribute Part VI into Part V or others.
// The existing JSX for Part VI is:
// {/* ═══════ Part VI: M&A 실사 인텔리전스 ═══════ */}
// <section>
//   ...
//   {widgets?.filter((w: any) => ['w65_ma_scorecard', 'w67_earnout_sim', 'w70_value_creation', 'w56_sunmin_pe_valuation', 'w72_fig_revenue_trend', 'w75_loligo_scientific_mgmt', 'w78_itq_transition_timeline'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
// </section>

// We need to merge those IDs into Part V.
// Find the Part V filter and append them.
const part5Match = content.match(/widgets\?\.filter\(\(w: any\) => \['([^\]]+)'\]\.includes\(w\.id\)\)\.map\(\(w: any\) => renderWidgetCard\(w\)\)/g);
if (part5Match && part5Match.length >= 5) {
  let part5Filter = part5Match[4];
  let newPart5Filter = part5Filter.replace("']", "', 'w65_ma_scorecard', 'w67_earnout_sim', 'w70_value_creation', 'w56_sunmin_pe_valuation', 'w72_fig_revenue_trend', 'w75_loligo_scientific_mgmt', 'w78_itq_transition_timeline']");
  content = content.replace(part5Filter, newPart5Filter);
}

// Remove Part VI section
content = content.replace(/\{\/\* ═══════ Part VI: M&A 실사 인텔리전스 ═══════ \*\/\}\s*<section>[\s\S]*?<\/section>/g, '');

// 5. Apply formatXAxis logic
const formatXAxisCode = `
const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  let formatted = tickItem.replace(/\s*\\(.*?\\)\s*/g, '');
  if (formatted.length > 6) {
    return formatted.substring(0, 6) + '..';
  }
  return formatted;
};
`;

if (!content.includes('const formatXAxis =')) {
  content = content.replace('const CustomTooltip =', formatXAxisCode + '\nconst CustomTooltip =');
}

// Ensure XAxis has formatXAxis
content = content.replace(/<XAxis dataKey=\{widget\.xKey\} stroke="#64748b" tick=\{newTickProps\} interval=\{0\} \/>/g, '<XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} interval={0} tickFormatter={formatXAxis} />');
content = content.replace(/<XAxis dataKey=\{xAxis\} stroke="#94a3b8" tick=\{xTickProps\} interval=\{0\} \/>/g, '<XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} interval={0} tickFormatter={formatXAxis} />');

// 6. Force monolithic colors in the renderChart
// Old format uses s.color. New format uses a.color or a.fill
// We can just add a global color override inside renderChart
// Or inject a palette.
const colorOverride = `
    const PALETTE = ["#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#a855f7", "#fb7185"];
    const getMonolithicColor = (i: number) => PALETTE[i % PALETTE.length];
`;

if (!content.includes('const getMonolithicColor')) {
  // Insert inside renderChart
  content = content.replace('const renderChart = (widget: any) => {', 'const renderChart = (widget: any) => {\n' + colorOverride);
}

// Replace s.color and a.color with getMonolithicColor(i)
content = content.replace(/stroke=\{a\.color \|\| a\.stroke \|\| a\.fill\}/g, 'stroke={getMonolithicColor(i)}');
content = content.replace(/fill=\{a\.color \|\| a\.fill\}/g, 'fill={getMonolithicColor(i)}');
content = content.replace(/fill=\{b\.color \|\| b\.fill\}/g, 'fill={getMonolithicColor(i)}');
content = content.replace(/stroke=\{l\.color \|\| l\.stroke \|\| l\.fill\}/g, 'stroke={getMonolithicColor(i)}');
content = content.replace(/stroke=\{s\.color\}/g, 'stroke={getMonolithicColor(i)}');
content = content.replace(/fill=\{s\.color\}/g, 'fill={getMonolithicColor(i)}');

// Also for `<stop offset="5%" stopColor={a.color || a.fill} stopOpacity={0.6}/>`
content = content.replace(/stopColor=\{a\.color \|\| a\.fill\}/g, 'stopColor={getMonolithicColor(i)}');

// Make sure `var(--color-success)` or similar rainbow stuff in the file are replaced if they are static.
content = content.replace(/color="var\(--color-success\)"/g, 'color="#ec4899"');
content = content.replace(/color="var\(--color-danger\)"/g, 'color="#8b5cf6"');
content = content.replace(/color="var\(--color-warning\)"/g, 'color="#d946ef"');
content = content.replace(/color="var\(--color-info\)"/g, 'color="#a855f7"');

// Ensure TakeawayBox props
content = content.replace(/actionPlan=\{takeaway\}/g, 'takeaway={takeaway}');

fs.writeFileSync(path, content, 'utf8');
console.log('Squid refactoring complete.');
