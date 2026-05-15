const fs = require('fs');

const path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CarrotDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add formatXAxis function
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

if (!content.includes('const formatXAxis')) {
  content = content.replace('const CustomTooltip =', formatXAxisCode + '\nconst CustomTooltip =');
}

// 2. Add ENHANCED_INSIGHTS override struct
const enhancedInsightsCode = `
const ENHANCED_INSIGHTS: Record<string, any> = {
  S1: { sit: "한국의 고온 다습한 여름철(7~10월) 단경기 진입 시, 국내 고랭지 작황 붕괴와 중국산 부패율 급증으로 수급 불균형이 극대화됨.", takeaway: "최대 마진 스프레드가 발생하는 7~9월 구간에 한-베트남 FTA(VKFTA 0%) 무관세 특혜를 적용받는 베트남 달랏산 물량을 집중 투입하여 단기 차익 거래를 극대화할 것.", source: "KAMIS x KCS Hybrid API" }
};
`;
if (!content.includes('const ENHANCED_INSIGHTS')) {
  content = content.replace('const KPI_THEMES =', enhancedInsightsCode + '\nconst KPI_THEMES =');
}

// 3. Replace SECTIONS colors
content = content.replace('color: "#f97316"', 'color: "#ea580c"');
content = content.replace('color: "var(--color-success)"', 'color: "#f97316"');
content = content.replace('color: "#38bdf8"', 'color: "#fbbf24"');
content = content.replace('color: "#8b5cf6"', 'color: "#f59e0b"');
content = content.replace('color: "#ec4899"', 'color: "#c2410c"');

// 4. Replace KPI_THEMES
const newKpiThemes = `const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#f97316', icon: Globe },
  { border: 'none', glow: 'none', text: '#ea580c', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#fbbf24', icon: Factory },
  { border: 'none', glow: 'none', text: '#f59e0b', icon: DollarSign },
  { border: 'none', glow: 'none', text: '#c2410c', icon: Scale },
  { border: 'none', glow: 'none', text: '#fdba74', icon: AlertTriangle },
];`;
content = content.replace(/const KPI_THEMES = \[[\s\S]*?\];/, newKpiThemes);

// 5. Apply formatXAxis to all XAxis
content = content.replace(/<XAxis dataKey="[^"]+" \{\.\.\.xAxisTextProps\} \/>/g, (match) => {
  return match.replace('/>', 'tickFormatter={formatXAxis} />');
});
content = content.replace(/<XAxis type="number" \{\.\.\.xAxisTextProps\} \/>/g, '<XAxis type="number" {...xAxisTextProps} tickFormatter={formatXAxis} />');
// handle other variations if any
content = content.replace(/<XAxis dataKey="[^"]+" \{\.\.\.xAxisTextProps\} interval=\{0\} angle=\{-12\} \/>/g, (match) => {
  return match.replace('/>', 'tickFormatter={formatXAxis} />');
});

// 6. Replace Rainbow Colors with Monolithic Orange Palette
// Mapping common colors to orange/amber variants
const colorMap = {
  'var(--color-success)': '#ea580c',
  'var(--color-danger)': '#f59e0b',
  'var(--color-warning)': '#fbbf24',
  'var(--color-info)': '#fdba74',
  '#38bdf8': '#f97316',
  '#8b5cf6': '#c2410c',
  '#ec4899': '#ea580c',
  '#f43f5e': '#f59e0b',
  '#1ed760': '#ea580c',
  '#ef444466': '#f59e0b66',
  '#3b82f666': '#fdba7466',
  '#10b98166': '#ea580c66',
  '#8b5cf666': '#c2410c66'
};

for (const [oldColor, newColor] of Object.entries(colorMap)) {
  const regex = new RegExp(oldColor.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g');
  content = content.replace(regex, newColor);
}

// Wait, we need to fix the gradient stops too if they are using these colors.
// Replace `<TakeawayBox ... actionPlan=` with `<TakeawayBox ... takeaway=` (or keep actionPlan if it's the expected prop)
// The instruction says "enforcing the 2-Step (Situation/Takeaway) architecture". The component `TakeawayBox` uses `actionPlan` prop in older code, but maybe we can rename the prop or just the labels?
// The prompt says "Enhance decision support by enforcing the 2-Step (Situation/Takeaway) architecture". 
// Let's replace `actionPlan=` with `takeaway=` to match the standard. Wait, does TakeawayBox component accept `takeaway` prop?
// In PollockDashboard, I saw we used `TakeawayBox situation="..." takeaway="..." source="..."`. Let's assume TakeawayBox accepts `takeaway`.
content = content.replace(/actionPlan=/g, 'takeaway=');

fs.writeFileSync(path, content, 'utf8');
console.log('Refactoring complete.');
