import re

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/ShrimpDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import TermTooltip
content = content.replace("import InfoTooltip from './InfoTooltip';", "import InfoTooltip from './InfoTooltip';\nimport TermTooltip from './TermTooltip';")

# 2. Add TERM_DICTIONARY and parseTextWithTooltips
parser_code = """
/* ─── Term Tooltip Parser ─── */
const TERM_DICTIONARY: Record<string, string> = {
  "EMS": "조기폐사증후군(Early Mortality Syndrome). 새우 양식업의 치명적 질병으로 폐사율이 100%에 달할 수 있음.",
  "FCR": "사료요구율(Feed Conversion Ratio). 생물 1kg을 생산하기 위해 투입되는 사료의 양. 낮을수록 효율적.",
  "바이오플락": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "Biofloc": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "IQF": "개별급속냉동(Individual Quick Freezing). 한 마리씩 영하 40도 이하로 급속 냉동하여 신선도를 유지하는 가공 기술.",
  "CSDDD": "EU 공급망 실사 지침(Corporate Sustainability Due Diligence Directive). 인권 및 환경 리스크 실사를 의무화한 법안.",
  "초분광": "초분광 이미징(Hyperspectral Imaging). 가시광선 외의 수백 개 파장을 분석하여 성분과 신선도를 비파괴적으로 검증하는 기술.",
  "미세조류": "미세조류(Microalgae). 어분(Fishmeal)을 대체할 수 있는 고단백질, 오메가-3 등 풍부한 영양을 가진 지속가능한 사료 원료."
};

const parseTextWithTooltips = (text: string) => {
  if (!text) return text;
  const terms = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const termKey = terms.find(t => t.toLowerCase() === part.toLowerCase());
    if (termKey) {
      return <TermTooltip key={i} term={part} description={TERM_DICTIONARY[termKey]} />;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};
"""

content = content.replace("const formatYAxis = (v: number) => {", parser_code + "\nconst formatYAxis = (v: number, unit?: string) => {")

# Modify formatYAxis inside
content = content.replace(
"""const formatYAxis = (v: number, unit?: string) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return v;
};""",
"""const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};"""
)

# Replace all `tickFormatter={formatYAxis}` with `tickFormatter={(v) => formatYAxis(v, widget.yUnit)}`
content = content.replace("tickFormatter={formatYAxis}", "tickFormatter={(v) => formatYAxis(v, widget.yUnit)}")

# 3. Apply parseTextWithTooltips
content = content.replace(
    "<p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{situation}</p>",
    "<p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{parseTextWithTooltips(situation)}</p>"
)

content = content.replace(
    "<p style={{ color: '#f8fafc', fontSize: '0.82rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{takeaway}</p>",
    "<p style={{ color: '#f8fafc', fontSize: '0.82rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{parseTextWithTooltips(takeaway)}</p>"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("TSX fixes applied successfully.")
