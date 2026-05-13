import re

with open('components/CocoaDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Widget 15 content
w15 = """
        {/* Widget 15 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:'#f59e0b', margin:'0 0 0.4rem' }}>
              <TrendingUp size={17} />가나 현지 가공 인프라 디스트레스 차익거래
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:400 }}>(단위: 천톤, %)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}>
                <InfoTooltip title="가나 가공공장 가동률" methodology="원물 부족으로 인한 현지 공장 가동률 추락치 반영" description="가동률 30% 미만 공장 M&A 기회" />
              </div>
            </h3>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cocoaData.w15_ghana_distressed}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="Capacity" name="가공 생산능력" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" />
                <Bar yAxisId="left" dataKey="Utilization" name="실제 가동량" fill="#ef4444" />
                <Line yAxisId="right" type="monotone" dataKey="ExportRatio" name="무가공 원물 수출비율(%)" stroke="#38bdf8" strokeWidth={2} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <div style={{ background:'rgba(2,14,28,0.45)', borderTop:`2px solid #ef4444`, borderRadius:'8px', padding:'12px' }}>
              <div style={{ paddingBottom:'8px', borderBottom:'1px dashed rgba(255,255,255,0.08)', marginBottom:'8px' }}>
                <h4 style={{ color:'#ef4444', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>📊 현황 분석 (SITUATION)</h4>
                <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>가나 현지 가공 공장들은 원물 부족으로 가동률이 30%대까지 폭락했습니다. 정부는 외화 확보를 위해 원물을 가공 없이 수출(ExportRatio 급증)하고 있습니다.</p>
              </div>
              <div>
                <h4 style={{ color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>
                <p style={{ color:'#fde68a', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>이 시기가 아프리카 현지 인프라를 헐값에 매입할 수 있는 &apos;Distressed Asset&apos; M&A 적기입니다. 현지 가공을 내재화하여 중간 마진을 흡수하십시오.</p>
              </div>
            </div>
          </div>
        </div>
"""

w16 = """
        {/* Widget 16 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:'#38bdf8', margin:'0 0 0.4rem' }}>
              <Scale size={17} />B2B CBE(대체유) 벤더 롤업 가치 평가
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:400 }}>(단위: EBITDA %, Agility)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}>
                <InfoTooltip title="비즈니스 모델별 가치" methodology="마진율과 원가부담 방어력" description="B2B 스페셜티 벤더의 기업 가치 급상승" />
              </div>
            </h3>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis type="number" dataKey="Agility" name="Agility(시장대응력)" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis type="number" dataKey="EBITDA" name="EBITDA(%)" stroke="#64748b" tick={{ fontSize: 9 }} />
                <ZAxis type="number" dataKey="CostBurden" range={[60, 400]} name="원가부담" />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                {cocoaData.w16_cbe_rollup.map((entry, index) => (
                  <Scatter key={`scatter-${index}`} name={entry.category} data={[entry]} fill={index === 2 ? '#38bdf8' : '#8b5cf6'} />
                ))}
              </ScatterChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <div style={{ background:'rgba(2,14,28,0.45)', borderTop:`2px solid #38bdf8`, borderRadius:'8px', padding:'12px' }}>
              <div style={{ paddingBottom:'8px', borderBottom:'1px dashed rgba(255,255,255,0.08)', marginBottom:'8px' }}>
                <h4 style={{ color:'#38bdf8', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>📊 현황 분석 (SITUATION)</h4>
                <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>B2C 프리미엄 초콜릿은 원가 압박으로 EBITDA가 무너졌습니다. 반면 팜유 베이스의 CBE(대체유) B2B 벤더들은 30%대 마진을 방어하며 급성장 중입니다.</p>
              </div>
              <div>
                <h4 style={{ color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>
                <p style={{ color:'#fde68a', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>유럽 B2C 브랜드를 인수할 때가 아닙니다. 아시아의 CBE 스페셜티 가공 벤더들을 롤업(Roll-up)하여 대체유 밸류체인을 지배하십시오.</p>
              </div>
            </div>
          </div>
        </div>
"""

w17_19 = """
        {/* Widget 17 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:'#10b981', margin:'0 0 0.4rem' }}>
              <MapPin size={17} />FTA 삼각 무역 & 역수출 (Sankey)
              <div style={{ marginLeft:'auto', flexShrink:0 }}>
                <InfoTooltip title="삼각 무역 물동량" methodology="원물-가공-수출 물류망 흐름" description="한국을 0% 관세 허브로 활용하는 수출 라우트" />
              </div>
            </h3>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <Sankey data={cocoaData.w17_fta_triangle} node={renderSankeyNode} nodePadding={30} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} link={{ stroke: 'rgba(255,255,255,0.1)' }}>
                <RechartsTooltip content={<CustomTooltip />} />
              </Sankey>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <div style={{ background:'rgba(2,14,28,0.45)', borderTop:`2px solid #10b981`, borderRadius:'8px', padding:'12px' }}>
              <div style={{ paddingBottom:'8px', borderBottom:'1px dashed rgba(255,255,255,0.08)', marginBottom:'8px' }}>
                <h4 style={{ color:'#10b981', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>📊 현황 분석 (SITUATION)</h4>
                <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>한국의 무관세 지위를 활용, 가나-인니(가공)-한국(허브)으로 이어지는 삼각 무역 라우트가 형성되었습니다. 이는 역내 수출 물류비용을 최소화합니다.</p>
              </div>
              <div>
                <h4 style={{ color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>
                <p style={{ color:'#fde68a', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>단순 수입국을 넘어 동북아 코코아 가공/물류 허브로 진화해야 합니다. 일본(프리미엄)과 중국(매스마켓)을 공략하는 중간 기지로 포지셔닝하십시오.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 18 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:'#ef4444', margin:'0 0 0.4rem' }}>
              <Landmark size={17} />아시아 내 프리미엄 차익거래
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:400 }}>(단위: 비율)</span>
            </h3>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={cocoaData.w18_asia_premium}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="country" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="PremiumShare" name="프리미엄 비중" stackId="a" fill="#ef4444" />
                <Bar dataKey="CBERatio" name="CBE 비중" stackId="a" fill="#38bdf8" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <div style={{ background:'rgba(2,14,28,0.45)', borderTop:`2px solid #ef4444`, borderRadius:'8px', padding:'12px' }}>
              <div style={{ paddingBottom:'8px', borderBottom:'1px dashed rgba(255,255,255,0.08)', marginBottom:'8px' }}>
                <h4 style={{ color:'#ef4444', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>📊 현황 분석 (SITUATION)</h4>
                <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>중국은 CBE 비중이 높고, 한국과 일본은 프리미엄 코코아 수요가 높습니다. 시장별 수용 단가(ImportCost) 불균형이 차익거래 기회를 창출합니다.</p>
              </div>
              <div>
                <h4 style={{ color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>
                <p style={{ color:'#fde68a', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>하이엔드 원료는 일본/한국으로, 매스 CBE 제품은 중국으로 스플릿(Split) 매각하는 차별적 포트폴리오를 구성해 수익을 극대화하십시오.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 19 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:'#ec4899', margin:'0 0 0.4rem' }}>
              <TestTube size={17} />K-뷰티/바이오 소재 전환 ROI
              <span style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:400 }}>(단위: 마진율 %)</span>
            </h3>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis type="category" dataKey="channel" name="채널" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis type="number" dataKey="Margin" name="마진율(%)" stroke="#64748b" tick={{ fontSize: 9 }} />
                <ZAxis type="number" dataKey="Defensibility" range={[60, 400]} name="방어력" />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                {cocoaData.w19_kbeauty_bio.map((entry, index) => (
                  <Scatter key={`scatter-${index}`} name={entry.channel} data={[entry]} fill="#ec4899" />
                ))}
              </ScatterChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <div style={{ background:'rgba(2,14,28,0.45)', borderTop:`2px solid #ec4899`, borderRadius:'8px', padding:'12px' }}>
              <div style={{ paddingBottom:'8px', borderBottom:'1px dashed rgba(255,255,255,0.08)', marginBottom:'8px' }}>
                <h4 style={{ color:'#ec4899', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>📊 현황 분석 (SITUATION)</h4>
                <p style={{ color:'#cbd5e1', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>식음료(B2B) 산업 내 마진율은 8%에 불과하나, 폴리페놀 추출을 통한 코스메슈티컬 전환 시 마진율이 52~65%로 급상승합니다.</p>
              </div>
              <div>
                <h4 style={{ color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, margin:'0 0 3px' }}>⚡ 전략적 시사점 (EXECUTIVE TAKEAWAY)</h4>
                <p style={{ color:'#fde68a', fontSize:'0.78rem', lineHeight:1.55, margin:0 }}>코코아를 단순 식품 원료가 아닌 고부가가치 K-바이오 원료로 재정의하십시오. 화장품 원료사와의 JV를 통해 독보적 프리미엄을 창출하십시오.</p>
              </div>
            </div>
          </div>
        </div>
"""

# Find Part II end (after w14)
w14_match = re.search(r'\{\/\* Widget 14 \*\/.*?(<div className=\{styles\.glassCard\}.*?</div>\n\s+</div>\n\s+</div>\n\s+</div>\n\s+</div>)', content, re.DOTALL)
if w14_match:
    w14_str = w14_match.group(0)
    # Actually wait, W14 is complex. I'll just find {/* Widget 14 */} and go to its end. 
    # Or just replace the `        {/* Widget 12 */}` which is Part III. Wait!
    # I can just insert w15 before Widget 5 (which is the first widget of Part III).
    pass

content = content.replace("{/* Widget 5 */}", w15 + "\n        {/* Widget 5 */}")
content = content.replace("{/* Widget 7 */}", w16 + "\n        {/* Widget 7 */}")
content = content.replace("{/* Widget 13 */}", w17_19 + "\n        {/* Widget 13 */}")

with open('components/CocoaDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

