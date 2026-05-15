import re

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "r") as f:
    lines = f.readlines()

def get_block(start_line_idx):
    stack = 0
    end_idx = start_line_idx
    for i in range(start_line_idx, len(lines)):
        line = lines[i]
        
        # very simple open/close div counter
        opens = len(re.findall(r'<div', line))
        closes = len(re.findall(r'</div', line))
        
        stack += opens
        stack -= closes
        
        if stack <= 0 and opens > 0: # if it closes the root div
            end_idx = i
            break
        elif stack <= 0 and i > start_line_idx:
            end_idx = i
            break
            
    return "".join(lines[start_line_idx:end_idx+1])

# Just mapping start line to the card names roughly based on previous analysis
blocks = {
    "escapement": get_block(998), # Line 999
    "ebcd": get_block(1042),      # Line 1043
    "feed": get_block(1084),      # Line 1085
    "tac_quota": get_block(1127), # Line 1128
    "oligopoly": get_block(1174), # Line 1175
    "mortality": get_block(1250), # Line 1251
    "asia_shift": get_block(353), # Line 354
    "aqua_prem": get_block(405),  # Line 406
    "gastronomy": get_block(445), # Line 446
    "arbitrage": get_block(490),  # Line 491
    "saudi_cold": get_block(584), # Line 585
    "qatar": get_block(616),      # Line 617
    "halal": get_block(657),      # Line 658
    "middle_east_channel": get_block(688), # Line 689
    "middle_east_strategy": get_block(713), # Line 714
    "simulator": get_block(739),  # Line 740
    "business_model": get_block(813), # 814
}

# Now we construct the new return statement body
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

# Replace in file
start_idx = 349  # Line 350
end_idx = 1284   # Line 1285

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "w") as f:
    f.writelines(lines[:start_idx])
    f.write(new_body)
    f.writelines(lines[end_idx+1:])

print("Successfully injected 5 Pillars!")
