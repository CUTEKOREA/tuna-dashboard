with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "r") as f:
    lines = f.readlines()

def get_block(start, end, wrapper=None):
    block = "".join(lines[start:end])
    if wrapper:
        return f"{{{wrapper} && (\n{block}\n)}}\n"
    return block + "\n"

blocks = {}
blocks["asia_shift"] = get_block(359, 409, "asianMarketShift")
blocks["aqua_prem"] = get_block(411, 450)
blocks["gastronomy"] = get_block(451, 494)
blocks["arbitrage"] = get_block(496, 587, "arbitrageRadar")
blocks["saudi_cold"] = get_block(590, 621, "arbitrageRadar")
blocks["qatar"] = get_block(622, 661, "arbitrageRadar")
blocks["halal"] = get_block(663, 693, "arbitrageRadar")
blocks["middle_east_channel"] = get_block(694, 718, "arbitrageRadar")
blocks["middle_east_strategy"] = get_block(719, 743, "arbitrageRadar")
blocks["simulator"] = get_block(745, 813, "arbitrageRadar")
blocks["business_model"] = get_block(818, 1002)
blocks["escapement"] = get_block(1004, 1046)
blocks["ebcd"] = get_block(1048, 1088)
blocks["feed"] = get_block(1090, 1131)
blocks["tac_quota"] = get_block(1133, 1178)
blocks["oligopoly"] = get_block(1180, 1254)
blocks["mortality"] = get_block(1256, 1290)

new_body = f"""
      {{/* ================== S-GRADE 5-PILLAR ARCHITECTURE ================== */}}

      {{/* 🌱 Part I — 원물 생산 (Raw Material) */}}
      <div style={{{{ padding:'1rem 1.5rem', background:'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, transparent 100%)', borderLeft:'4px solid #f59e0b', marginBottom:'1.5rem', marginTop:'3rem' }}}}>
        <div style={{{{ display:'flex', alignItems:'center', gap:'10px' }}}}>
          <h2 style={{{{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}}}>🌱 Part I — 원물 생산 (Raw Material)</h2>
        </div>
        <p style={{{{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}}}>블루핀 도피회유, TAC 쿼터 과점, 자연폐사율 리스크 등 원물 조달의 근본적 제약과 기회</p>
      </div>
      <div className={{insightsStyles.grid}} style={{{{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '2rem' }}}}>
{blocks["escapement"]}
{blocks["tac_quota"]}
{blocks["oligopoly"]}
{blocks["mortality"]}
      </div>

      {{/* 🏭 Part II — 가공 산업 (Processing) */}}
      <div style={{{{ padding:'1rem 1.5rem', background:'linear-gradient(90deg, rgba(236,72,153,0.15) 0%, transparent 100%)', borderLeft:'4px solid #ec4899', marginBottom:'1.5rem', marginTop:'3rem' }}}}>
        <div style={{{{ display:'flex', alignItems:'center', gap:'10px' }}}}>
          <h2 style={{{{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}}}>🏭 Part II — 가공 산업 (Processing)</h2>
        </div>
        <p style={{{{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}}}>초저온 이케지메 가공을 통한 양식/어획 패러다임 역전 및 원가-마진 시뮬레이션</p>
      </div>
      <div className={{insightsStyles.grid}} style={{{{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '2rem' }}}}>
{blocks["aqua_prem"]}
{blocks["simulator"]}
      </div>

      {{/* 🚢 Part III — 물류 및 무역 (Logistics & Trading) */}}
      <div style={{{{ padding:'1rem 1.5rem', background:'linear-gradient(90deg, rgba(56,189,248,0.15) 0%, transparent 100%)', borderLeft:'4px solid #38bdf8', marginBottom:'1.5rem', marginTop:'3rem' }}}}>
        <div style={{{{ display:'flex', alignItems:'center', gap:'10px' }}}}>
          <h2 style={{{{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}}}>🚢 Part III — 물류 및 무역 (Logistics & Trading)</h2>
        </div>
        <p style={{{{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}}}>글로벌 B2B 아비트라지, 중동 콜드체인망 확충 및 CEPA 기반 재수출 허브 전략</p>
      </div>
{blocks["business_model"]}
      <div className={{insightsStyles.grid}} style={{{{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '2rem' }}}}>
{blocks["arbitrage"]}
{blocks["saudi_cold"]}
      </div>

      {{/* 🛒 Part IV — 판매 및 수요 (Sales & Demand) */}}
      <div style={{{{ padding:'1rem 1.5rem', background:'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, transparent 100%)', borderLeft:'4px solid #10b981', marginBottom:'1.5rem', marginTop:'3rem' }}}}>
        <div style={{{{ display:'flex', alignItems:'center', gap:'10px' }}}}>
          <h2 style={{{{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}}}>🛒 Part IV — 판매 및 수요 (Sales & Demand)</h2>
        </div>
        <p style={{{{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}}}>아시아 럭셔리 마켓 시프트, 중동(카타르/UAE) 프리미엄 시장 진입장벽 및 소비 채널 분석</p>
      </div>
      <div className={{insightsStyles.grid}} style={{{{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '2rem' }}}}>
{blocks["asia_shift"]}
{blocks["gastronomy"]}
{blocks["qatar"]}
{blocks["halal"]}
{blocks["middle_east_channel"]}
{blocks["middle_east_strategy"]}
      </div>

      {{/* 🌍 Part V — ESG 및 지속가능성 (Sustainability) */}}
      <div style={{{{ padding:'1rem 1.5rem', background:'linear-gradient(90deg, rgba(139,92,246,0.15) 0%, transparent 100%)', borderLeft:'4px solid #8b5cf6', marginBottom:'1.5rem', marginTop:'3rem' }}}}>
        <div style={{{{ display:'flex', alignItems:'center', gap:'10px' }}}}>
          <h2 style={{{{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}}}>🌍 Part V — ESG 및 지속가능성 (Sustainability)</h2>
        </div>
        <p style={{{{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}}}>eBCD 컴플라이언스 및 생사료 의존도/FIFO 위기로 인한 장기 환경 리스크 관리</p>
      </div>
      <div className={{insightsStyles.grid}} style={{{{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '2rem' }}}}>
{blocks["ebcd"]}
{blocks["feed"]}
      </div>
"""

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "w") as f:
    f.writelines(lines[:355])
    f.write(new_body)
    f.writelines(lines[1291:])

print("Successfully injected 5 Pillars!")
