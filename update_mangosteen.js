const fs = require('fs');
const file = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/MangosteenDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace small things
content = content.replace(/<Legend wrapperStyle=\{\{ fontSize: '11px', color: '#94a3b8' \}\} \/>/g, '<Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />');

// Adding Legend where missing after CustomTooltip
content = content.replace(/<RechartsTooltip content=\{\<CustomTooltip \/\>\} \/>\s*(?!<Legend)/g, '<RechartsTooltip content={<CustomTooltip />} />\n                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />\n');

content = content.replace(/height: '240px'/g, "height: '375px'");
content = content.replace(/val\.length > 6 \? val\.substring\(0, 6\)/g, "val.length > 12 ? val.substring(0, 12)");
content = content.replace(/minTickGap: 30/g, "minTickGap: 20");
content = content.replace(/syncDate="2026\.05\.15"/g, 'syncDate="2026.05.17"');

// 2. Insert States
const stateInsertIdx = content.indexOf("const [lastUpdate, setLastUpdate] = useState<string>('');");
const statesToInsert = `const [lastUpdate, setLastUpdate] = useState<string>('');

  const [liveCommerceData] = useState([
    { name: '오프라인 도매', value: 75, fill: '#c026d3' },
    { name: 'D2C 커머스', value: 25, fill: '#f97316' }
  ]);
  const [packagingData] = useState([
    { year: '2025', 원물: 70, 인건비: 15, 라벨링패키징: 15 },
    { year: '2026(E)', 원물: 70, 인건비: 16, 라벨링패키징: 22 }
  ]);
  const [fxMarginData] = useState([
    { month: '1월', 환율: 35.5, 마진: 12 },
    { month: '2월', 환율: 36.2, 마진: 15 },
    { month: '3월', 환율: 37.1, 마진: 19 },
    { month: '4월', 환율: 38.5, 마진: 23 },
    { month: '5월(E)', 환율: 39.2, 마진: 26 },
  ]);`;
if(stateInsertIdx !== -1) {
    content = content.substring(0, stateInsertIdx) + statesToInsert + content.substring(stateInsertIdx + 59);
}

// 3. Insert Widget B (Packaging) before Pillar 3
const target1 = `          <TakeawayBox 
            situation="일반 해상 냉장 운송 시 25일 차에 수율이 5%로 급락하여 값비싼 항공 운송($5.5/kg)이 강제되고 있습니다." 
            actionPlan="가스 처리 기술 도입 시 해상 운송(25일 차)에도 수율을 78% 이상 방어할 수 있어, 해상 운송비 절감($2.95/kg) 및 소매점 체류 시간 확장이 가능합니다."
          />
        </div>
      </div>

      {/* ═══ Pillar 3: 물류 & 통관 ═══ */}`;
const widgetB = `          <TakeawayBox 
            situation="일반 해상 냉장 운송 시 25일 차에 수율이 5%로 급락하여 값비싼 항공 운송($5.5/kg)이 강제되고 있습니다." 
            actionPlan="가스 처리 기술 도입 시 해상 운송(25일 차)에도 수율을 78% 이상 방어할 수 있어, 해상 운송비 절감($2.95/kg) 및 소매점 체류 시간 확장이 가능합니다."
          />
        </div>

        {/* Widget 2-3 (New: Packaging) */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <Factory size={18} color="#c026d3" /> 동남아 라벨링 규제발 원가 상승
              </h3>
            </div>
            <TelemetryBadge status="static" syncDate="2026.05.17" />
          </div>
          <div style={{ height: '375px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={packagingData}>
                {grid}
                <XAxis dataKey="year" {...xAxisProps} />
                <YAxis {...yAxisProps} label={{ value: '비용 비중 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                <Bar dataKey="원물" stackId="a" name="원물 비용" fill="#64748b" barSize={40} />
                <Bar dataKey="인건비" stackId="a" name="인건비" fill="#c026d3" />
                <Bar dataKey="라벨링패키징" name="패키징 규제 비용" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="동남아 현지 식품 라벨링 및 패키징 규제가 강화됨에 따라 생산 원가 내 패키징 비용 비중이 급증할 전망입니다." 
            actionPlan="벌크 단위 수입 후 국내 자체 패키징 라인을 가동하거나, 규제가 덜한 베트남 등 제3국에서 1차 가공을 마치는 우회 생산로를 구축해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Pillar 3: 물류 & 통관 ═══ */}`;
content = content.replace(target1, widgetB);


// 4. Insert Widget C (FX Margin Simulator) before Pillar 4
const target2 = `          <TakeawayBox 
            situation="태국산 직수입 시 자유무역협정 한계로 인해 24%의 높은 할당 및 기본 관세가 부과됩니다." 
            actionPlan="저단가 인니 원물을 베트남으로 수출해 1차 가공한 후, 무관세 조항을 활용해 한국에 반입하는 역내포괄적경제동반자협정(RCEP) 삼각 무역 라인을 개척하십시오."
          />
        </div>
      </div>

      {/* ═══ Pillar 4: 판매 & 수요 ═══ */}`;
const widgetC = `          <TakeawayBox 
            situation="태국산 직수입 시 자유무역협정 한계로 인해 24%의 높은 할당 및 기본 관세가 부과됩니다." 
            actionPlan="저단가 인니 원물을 베트남으로 수출해 1차 가공한 후, 무관세 조항을 활용해 한국에 반입하는 역내포괄적경제동반자협정(RCEP) 삼각 무역 라인을 개척하십시오."
          />
        </div>

        {/* Widget 3-4 (New: FX Margin Simulator) */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <Coins size={18} color="var(--color-warning)" /> 역내 환차익(바트화/동화) 시뮬레이터
              </h3>
            </div>
            <TelemetryBadge status="live" syncDate="2026.05.17" />
          </div>
          <div style={{ height: '375px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fxMarginData}>
                {grid}
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis yAxisId="left" domain={[30, 45]} {...yAxisProps} label={{ value: '환율 (원/바트)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 35]} {...yAxisProps} label={{ value: '최종 마진 (%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                <Bar yAxisId="right" dataKey="마진" name="마진율 (%)" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="환율" name="바트화 환율(원)" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="동남아 주요 통화(특히 바트화)의 가치 상승이 매입 원가 상승 압력으로 작용하며 환리스크가 가중되고 있습니다." 
            actionPlan="태국 직수입 물량의 결제 통화를 다변화하거나, 환율 변동성이 적은 동화(베트남) 결제 라인을 우회 구매 루트로 적극 활용하여 환차익을 극대화해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Pillar 4: 판매 & 수요 ═══ */}`;
content = content.replace(target2, widgetC);


// 5. Insert Widget A (Live Commerce Risk) before Pillar 5
const target3 = `          <TakeawayBox 
            situation="한국 물류 허브를 거쳐 몽골, 괌 등으로 향하는 망고스틴 재수출 단가는 최고 12.4달러(kg당)를 기록하며 압도적인 마진을 냅니다." 
            actionPlan="과피 경화 결함을 원천 차단한 최상급 1%의 물량만을 선별하여, 구매력이 높은 고급 리조트 시장에 자체 브랜드로 재수출하는 파이프라인을 공격적으로 확장해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Pillar 5: ESG & 지속가능성 ═══ */}`;
const widgetA = `          <TakeawayBox 
            situation="한국 물류 허브를 거쳐 몽골, 괌 등으로 향하는 망고스틴 재수출 단가는 최고 12.4달러(kg당)를 기록하며 압도적인 마진을 냅니다." 
            actionPlan="과피 경화 결함을 원천 차단한 최상급 1%의 물량만을 선별하여, 구매력이 높은 고급 리조트 시장에 자체 브랜드로 재수출하는 파이프라인을 공격적으로 확장해야 합니다."
          />
        </div>

        {/* Widget 4-4 (New: Live Commerce Risk) */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                <AlertTriangle size={18} color="#ef4444" /> 중국 라이브 커머스 D2C 타격 리스크
              </h3>
            </div>
            <TelemetryBadge status="live" syncDate="2026.05.17" />
          </div>
          <div style={{ height: '375px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={liveCommerceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}>
                  {liveCommerceData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              </PieChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="최근 중국 당국의 라이브 커머스 품질/위생 규제 강화로 인해 주요 D2C(소비자 직접 판매) 채널의 매출 비중이 25% 이하로 위축되었습니다." 
            actionPlan="불안정한 B2C/D2C 판매 비중을 축소하고, 검증된 도매 채널 및 오프라인 대형 유통망(B2B) 중심의 안정적 매출 포트폴리오로 신속히 재편해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Pillar 5: ESG & 지속가능성 ═══ */}`;
content = content.replace(target3, widgetA);

fs.writeFileSync(file, content, 'utf8');
console.log('Update script executed successfully.');
