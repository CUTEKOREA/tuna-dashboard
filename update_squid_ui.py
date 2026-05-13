import re

with open('components/SquidDashboard.tsx', 'r') as f:
    content = f.read()

# Add state variables
state_injection = """  const [showEdu, setShowEdu] = useState(true);
  const [mgoPrice, setMgoPrice] = useState(107);
  const [fxRate, setFxRate] = useState(1350);
  const [apiStatus, setApiStatus] = useState("Connected");
"""
content = content.replace("  const [showEdu, setShowEdu] = useState(true);", state_injection)

# Add the Live Pulse Indicator
header_replacement = """          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(139, 92, 246, 0.2)', 
            borderRadius: '8px', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
            <span>9 APIs <span style={{ color: '#10b981' }}>{apiStatus}</span></span>
            <span style={{ margin: '0 8px', color: '#334155' }}>|</span>
            <span style={{ color: '#8b5cf6' }}>FishStatJ 1950-2024</span>
          </div>"""

content = re.sub(r'<div style=\{\{\s*fontSize:\s*\'0\.8rem\',\s*padding:\s*\'0\.5rem 1rem\',\s*background:\s*\'rgba\(15, 23, 42, 0\.7\)\',\s*border:\s*\'1px solid rgba\(139, 92, 246, 0\.2\)\',\s*borderRadius:\s*\'8px\',\s*color:\s*\'#94a3b8\',\s*fontWeight:\s*500\s*\}\}>\s*<span style=\{\{\s*color:\s*\'#8b5cf6\'\s*\}\}>FishStatJ 1950-2024</span> · Claude Verified\s*</div>', header_replacement, content)

# Add API Control Center before Crisis Management
api_control_center = """
      {/* ═══ API COMMAND CENTER ═══ */}
      <section style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Scenario Simulator */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', color: '#8b5cf6' }}>
            <Activity size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>실시간 시나리오 시뮬레이터</h3>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Rotterdam MGO (선박유)</span>
              <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>${mgoPrice}/bbl</span>
            </div>
            <input 
              type="range" min="60" max="150" value={mgoPrice} 
              onChange={(e) => setMgoPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ef4444' }} 
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>USD/KRW 환율 (관세 타격)</span>
              <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>₩{fxRate}</span>
            </div>
            <input 
              type="range" min="1200" max="1500" value={fxRate} 
              onChange={(e) => setFxRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }} 
            />
          </div>
        </div>

        {/* Intelligence Feed / Alert Drawer */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', color: '#10b981' }}>
            <Globe size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>API Intelligence 피드</h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: '#10b981', color: '#0f172a', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>LIVE</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '10px', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5' }}>[기상청 API] ENSO 임계치 돌파</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>태평양 SST 이상 기온 지속. 공해상 조업 확대 지시가 필요합니다.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', padding: '0.8rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              <TrendingUp size={16} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.8rem', fontWeight: 600, color: '#bae6fd' }}>[EUMOFA API] Vigo항 단가 급등</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1' }}>Illex 도소매 스프레드 42% 도달. B2B 직수출 최적 타이밍입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}
"""

content = content.replace("      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}", api_control_center)

# Add custom CSS for pulse animation if not exists
css_injection = """
<style>
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
</style>
"""

# Check if global style might be injected or just put it directly in the component before return
content = content.replace("    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: \"'Inter', sans-serif\" }}>",
"""    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>""")

with open('components/SquidDashboard.tsx', 'w') as f:
    f.write(content)

print("SquidDashboard.tsx updated.")
