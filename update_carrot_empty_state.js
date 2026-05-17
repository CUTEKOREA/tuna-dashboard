const fs = require('fs');
const file = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CarrotDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The standard Empty State snippet to inject
const emptyStateSnippet = `
      <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#64748b',background:'rgba(255,255,255,0.02)',borderRadius:'8px',border:'1px dashed rgba(255,255,255,0.1)'}}>
        <AlertTriangle size={24} style={{marginBottom:'8px',opacity:0.5}}/>
        <span style={{fontSize:'0.85rem',fontWeight:600}}>데이터 집계 중</span>
        <span style={{fontSize:'0.7rem',opacity:0.7,marginTop:'4px'}}>실시간 파이프라인 동기화 대기</span>
      </div>
`;

// Regex to find:
// <SafeResponsiveContainer width="100%" height="100%">
//   <ChartComponent data={someData} ...>
const regex = /<SafeResponsiveContainer\s+width="100%"\s+height="100%">\s*<([A-Za-z]+Chart)([^>]*?)data=\{([^>]+?)\}/g;

content = content.replace(regex, (match, chartType, beforeData, dataStr) => {
    // If it's the PieChart which has a complex data expression, we can extract the base array.
    // E.g., data={(faoTradeLive as any).links ? ... : []}
    // We can just use the literal dataStr in the check, but it might be unsafe if it evaluates to something complex.
    // To be safe, we just check `($dataStr) && ($dataStr).length > 0`.
    
    // We wrap the SafeResponsiveContainer entirely.
    // Wait, the regex only matches the opening of the chart, so replacing just that will break the closing tags.
    // So wrapping the whole SafeResponsiveContainer is better.
    return match; // return unmodified for now, let's test if it matches.
});

// Instead of doing complex regex, let's just make a new component called SafeChartRenderer that takes data and children.
// But we can't easily pass children without parsing JSX.

// Alternatively, let's create a wrapper inside CarrotDashboard.tsx:
const wrapperComponent = `
const ChartWrapper = ({ data, children }: { data: any, children: React.ReactNode }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#64748b',background:'rgba(255,255,255,0.02)',borderRadius:'8px',border:'1px dashed rgba(255,255,255,0.1)'}}>
        <AlertTriangle size={24} style={{marginBottom:'8px',opacity:0.5}}/>
        <span style={{fontSize:'0.85rem',fontWeight:600}}>데이터 집계 중</span>
        <span style={{fontSize:'0.7rem',opacity:0.7,marginTop:'4px'}}>실시간 파이프라인 동기화 대기</span>
      </div>
    );
  }
  return <>{children}</>;
};
`;

if (!content.includes('ChartWrapper')) {
    // Insert after CustomTooltip
    content = content.replace('const CustomTooltip =', wrapperComponent + '\nconst CustomTooltip =');
}

// Now wrap SafeResponsiveContainer with ChartWrapper
// We can use a replacer that uses regex to find the data attribute of the first child chart.
const wrapRegex = /(<SafeResponsiveContainer\s+width="100%"\s+height="100%">\s*<[A-Za-z]+Chart[^>]*?data=\{)([^>]+?)(\}[^>]*>[\s\S]*?<\/SafeResponsiveContainer>)/g;
content = content.replace(wrapRegex, (match, prefix, dataStr, suffix) => {
    // If it's already wrapped, skip
    return `<ChartWrapper data={${dataStr}}>\n            ${match}\n          </ChartWrapper>`;
});

fs.writeFileSync(file, content);
console.log('Done injecting Empty State wrappers.');
