import React from 'react';
import { MapPin, ShieldAlert, Anchor } from 'lucide-react';

export default function WestAfricaMap() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '250px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(140,170,255,0.10)' }}>
      {/* Background Stylized "Coastline" */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,0 L100,0 L100,100 L60,100 Q50,70 30,80 Q10,90 0,60 Z" fill="var(--w-slate-400)" />
        <path d="M30,80 Q50,70 60,100 L100,100 L100,100 Z" fill="var(--color-info)" opacity={0.5} />
      </svg>
      
      {/* Map Content Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-slate-400)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} /> West Africa Geo-Risk
        </h4>
        
        {/* Nodes */}
        {/* Farm Gates */}
        <div style={{ position: 'absolute', top: '35%', left: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'var(--color-success)' }}></div>
            <div style={{ position:'absolute', top:'-4px', left:'-4px', width:'20px', height:'20px', borderRadius:'50%', border:'1px solid var(--w-emerald-500)', opacity:0.5 }}></div>
          </div>
          <span style={{ fontSize:'0.65rem', color:'var(--color-success)', fontWeight:600, marginTop:'4px' }}>Benue (Farm)</span>
        </div>
        
        <div style={{ position: 'absolute', top: '55%', left: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'var(--color-success)' }}></div>
            <div style={{ position:'absolute', top:'-4px', left:'-4px', width:'20px', height:'20px', borderRadius:'50%', border:'1px solid var(--w-emerald-500)', opacity:0.5 }}></div>
          </div>
          <span style={{ fontSize:'0.65rem', color:'var(--color-success)', fontWeight:600, marginTop:'4px' }}>Kogi (Farm)</span>
        </div>

        {/* Cartel Red Zones */}
        <div style={{ position: 'absolute', top: '25%', left: '65%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldAlert size={20} color="var(--color-danger)" className="animate-pulse" />
          <span style={{ fontSize:'0.65rem', color:'var(--color-danger)', fontWeight:600, marginTop:'4px', background:'rgba(239,68,68,0.1)', padding:'2px 4px', borderRadius:'4px' }}>Sahel Cartel</span>
        </div>

        <div style={{ position: 'absolute', top: '65%', left: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldAlert size={16} color="var(--color-danger)" className="animate-pulse" />
          <span style={{ fontSize:'0.65rem', color:'var(--color-danger)', fontWeight:600, marginTop:'4px', background:'rgba(239,68,68,0.1)', padding:'2px 4px', borderRadius:'4px' }}>ASM Blockade</span>
        </div>

        {/* Port */}
        <div style={{ position: 'absolute', top: '80%', left: '55%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background:'rgba(59,130,246,0.2)', padding:'4px', borderRadius:'4px', border:'1px solid var(--w-blue-500)' }}>
            <Anchor size={16} color="var(--color-info)" />
          </div>
          <span style={{ fontSize:'0.65rem', color:'var(--color-info)', fontWeight:600, marginTop:'4px' }}>Lagos Port</span>
        </div>
        
        {/* Logistics Routes */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Benue to Lagos */}
          <path d="M 25% 35% L 55% 80%" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="3 3" opacity={0.6} />
          {/* Kogi to Lagos */}
          <path d="M 45% 55% L 55% 80%" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="3 3" opacity={0.6} />
          {/* Blocked routes (Red cross) */}
          <line x1="30%" y1="50%" x2="40%" y2="60%" stroke="var(--color-danger)" strokeWidth="2" opacity={0.8} />
          <line x1="40%" y1="50%" x2="30%" y2="60%" stroke="var(--color-danger)" strokeWidth="2" opacity={0.8} />
        </svg>

      </div>
      
      {/* Legend */}
      <div style={{ position:'absolute', bottom: '10px', left: '10px', display:'flex', gap:'8px', fontSize:'0.6rem', color:'var(--w-slate-400)', background:'rgba(0, 0, 0, 0.2)', padding:'6px 10px', borderRadius:'6px', border:'1px solid rgba(140,170,255,0.10)', backdropFilter:'blur(4px)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--color-success)'}}/> 농가 (신선)</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Anchor size={10} color="var(--color-info)" /> 항구 (가공)</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><ShieldAlert size={10} color="var(--color-danger)" /> 무장세력 (병목)</span>
      </div>
    </div>
  );
}
