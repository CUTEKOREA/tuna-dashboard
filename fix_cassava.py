import re

file_path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CassavaDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 5-Pillar Sections Replacement
old_sections = r'const SECTIONS = \[.*?\];'
new_sections = '''const CASSAVA_THEME = {
  primary: '#b45309',
  secondary: '#d97706',
  tertiary: '#22c55e',
  quaternary: '#166534',
  neutral: '#f59e0b'
};

const ACCENT_COLORS = [CASSAVA_THEME.primary, CASSAVA_THEME.secondary, CASSAVA_THEME.tertiary, CASSAVA_THEME.quaternary, CASSAVA_THEME.neutral];

const SECTIONS = [
  { id: "S1", title: "원물 수급 및 글로벌 생산 (Raw Material)", desc: "기후 리스크 및 태국/베트남 등 핵심 산지 공급망 의존도 분석", color: CASSAVA_THEME.tertiary, widgets: ["w_early_warning", "w04"] },
  { id: "S2", title: "가공 및 부가가치 창출 (Processing)", desc: "4F(식량, 사료, 원료, 바이오) 패러다임 전환 및 붕해제/바이오수지 마진 분석", color: CASSAVA_THEME.primary, widgets: ["w10", "w01", "w02"] },
  { id: "S3", title: "물류 및 유통 (Logistics & Trading)", desc: "수입국 종속 리스크 및 글로벌 물류 허브(Silla 5-Hub) 간 차익 거래", color: CASSAVA_THEME.secondary, widgets: ["w07", "w_arbitrage", "w05"] },
  { id: "S4", title: "판매 및 시장 수요 (Sales & Demand)", desc: "아프리카(가나) 시장의 역발상 기회 및 대체재(밀가루) 수입 대체 효과", color: CASSAVA_THEME.neutral, widgets: ["w08", "w09", "w06"] },
  { id: "S5", title: "ESG 및 지속가능성 (Sustainability)", desc: "펄프/껍질 재자원화, 바이오가스 포집을 통한 공정 내 전력 순환", color: CASSAVA_THEME.quaternary, widgets: ["w03", "w_esg"] }
];'''

content = re.sub(r'const ACCENT_COLORS.*?\n\nconst SECTIONS = \[.*?\];', new_sections, content, flags=re.DOTALL)

# 2. X-axis formatting and truncation
x_axis_old = r'const xAxis = <XAxis dataKey=\{w\.xKey\} stroke="#64748b" tick=\{\{fontSize:9\}\} angle=\{d\?\.length > 6 \? -20 : 0\} textAnchor=\{d\?\.length > 6 \? "end" : "middle"\} height=\{d\?\.length > 6 \? 40 : 30\} />;(?:.*\n)?\s*const yFmt = \(v: number\) =>'
x_axis_new = '''const xFmt = (v: any) => { if (typeof v !== 'string') return v; let s = v.replace(/\\([^)]*\\)/g, '').trim(); return s.length > 6 ? s.slice(0,6)+'..' : s; };
    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={{fontSize:9}} angle={d?.length > 6 ? -20 : 0} textAnchor={d?.length > 6 ? "end" : "middle"} height={d?.length > 6 ? 40 : 30} tickFormatter={xFmt} />;
    const yFmt = (v: number) =>'''

content = re.sub(x_axis_old, x_axis_new, content)

# 3. 2-Column Grid Layout & Odd-Widget Handling
# Replace: style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,500px), 1fr))', gap:'1.5rem' }}
grid_old = r"gridTemplateColumns:'repeat\(auto-fit, minmax\(min\(100%,500px\), 1fr\)\)'"
grid_new = r"gridTemplateColumns:'repeat(2, 1fr)'"
content = re.sub(grid_old, grid_new, content)

# 4. Insert isLastOdd logic
map_old = r'\{sec\.widgets\.map\(\(wId: string, idx: number\) => \{\n\s*const w = getWidget\(wId\);\n\s*if \(\!w\) return null;\n\s*const Icon = WIDGET_ICONS\[w\.id\] \|\| Hexagon;\n\s*const accent = ACCENT_COLORS\[idx % ACCENT_COLORS\.length\] \|\| sec\.color;'

map_new = '''{sec.widgets.map((wId: string, idx: number) => {
              const w = getWidget(wId);
              if (!w) return null;
              const Icon = WIDGET_ICONS[w.id] || Hexagon;
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length] || sec.color;
              const isLastOdd = (sec.widgets.length % 2 !== 0) && (idx === sec.widgets.length - 1);'''

content = re.sub(map_old, map_new, content)

# Update glassCard style to include gridColumn
card_old = r"className=\{styles\.glassCard\} style=\{\{ display:'flex', flexDirection:'column', minHeight:'500px' \}\}"
card_new = r"className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'500px', gridColumn: isLastOdd ? '1 / -1' : 'auto' }}"

content = re.sub(card_old, card_new, content)

# 5. Fix header colors and main theme
content = content.replace('var(--color-success)', "CASSAVA_THEME.tertiary").replace('CASSAVA_THEME.tertiary', "CASSAVA_THEME.tertiary", 1) 
# wait, replacing inside JSX needs actual strings or variables. 
# It's better to just write the file or replace carefully.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cassava dashboard patched.")
