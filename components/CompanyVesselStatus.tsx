'use client';

import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

export default function CompanyVesselStatus() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/company_vessel_status.json')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(e => console.error(e));
  }, []);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>
        <Building2 size={18} /> 회사별 업종별 어선보유 현황 (Total Fleet Registry by Company)
      </h4>

      <div style={{ 
        background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', 
        overflow: 'auto', maxHeight: '400px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th rowSpan={2} style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)' }}>구분</th>
              <th rowSpan={2} style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', minWidth: '120px' }}>회사명</th>
              <th rowSpan={2} style={{ padding: '10px', color: '#34d399', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.05)' }}>소계</th>
              <th colSpan={2} style={{ padding: '6px', color: '#60a5fa', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>참치</th>
              <th colSpan={5} style={{ padding: '6px', color: 'var(--color-success)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>트롤</th>
              <th style={{ padding: '6px', color: 'var(--color-warning)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>오징어</th>
              <th colSpan={2} style={{ padding: '6px', color: '#818cf8', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>꽁치</th>
              <th colSpan={2} style={{ padding: '6px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>기타</th>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {/* 참치 */}
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>연승</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, borderRight: '1px solid rgba(255,255,255,0.05)' }}>선망</th>
              {/* 트롤 */}
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>북양</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>태평</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>대서</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>인도</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, borderRight: '1px solid rgba(255,255,255,0.05)' }}>남빙</th>
              {/* 오징어 */}
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, borderRight: '1px solid rgba(255,255,255,0.05)' }}>오채</th>
              {/* 꽁치 */}
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>오꽁</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, borderRight: '1px solid rgba(255,255,255,0.05)' }}>꽁치</th>
              {/* 기타 */}
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>저연</th>
              <th style={{ padding: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>통저</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isMajor = ['신라교역', '동원산업', '동원수산', '사조산업'].includes(row.company);
              return (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: idx !== data.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: isMajor ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.background = isMajor ? 'rgba(56, 189, 248, 0.05)' : 'transparent'}
                >
                  <td style={{ padding: '8px', color: 'rgba(255,255,255,0.4)' }}>{row.id}</td>
                  <td style={{ padding: '8px', color: isMajor ? '#38bdf8' : 'rgba(255,255,255,0.8)', fontWeight: isMajor ? 700 : 400, textAlign: 'left' }}>{row.company}</td>
                  <td style={{ padding: '8px', color: '#34d399', fontWeight: 600 }}>{row.total}</td>
                  
                  <td style={{ padding: '8px', color: row.tuna_longline > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.tuna_longline || '-'}</td>
                  <td style={{ padding: '8px', color: row.tuna_seine > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.tuna_seine || '-'}</td>
                  
                  <td style={{ padding: '8px', color: row.trawl_north > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.trawl_north || '-'}</td>
                  <td style={{ padding: '8px', color: row.trawl_pacific > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.trawl_pacific || '-'}</td>
                  <td style={{ padding: '8px', color: row.trawl_atlantic > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.trawl_atlantic || '-'}</td>
                  <td style={{ padding: '8px', color: row.trawl_indian > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.trawl_indian || '-'}</td>
                  <td style={{ padding: '8px', color: row.trawl_antarctic > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.trawl_antarctic || '-'}</td>
                  
                  <td style={{ padding: '8px', color: row.squid_jigging > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.squid_jigging || '-'}</td>
                  
                  <td style={{ padding: '8px', color: row.squid_saury > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.squid_saury || '-'}</td>
                  <td style={{ padding: '8px', color: row.saury > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.saury || '-'}</td>
                  
                  <td style={{ padding: '8px', color: row.other_bottom > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.other_bottom || '-'}</td>
                  <td style={{ padding: '8px', color: row.other_trap > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)' }}>{row.other_trap || '-'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <td colSpan={2} style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 700 }}>합계 (38개사)</td>
              <td style={{ padding: '12px 8px', color: '#34d399', fontWeight: 800, fontSize: '1rem' }}>198</td>
              
              <td style={{ padding: '12px 8px', color: '#60a5fa', fontWeight: 700 }}>105</td>
              <td style={{ padding: '12px 8px', color: '#60a5fa', fontWeight: 700 }}>27</td>
              
              <td style={{ padding: '12px 8px', color: 'var(--color-success)', fontWeight: 700 }}>3</td>
              <td style={{ padding: '12px 8px', color: 'var(--color-success)', fontWeight: 700 }}>-</td>
              <td style={{ padding: '12px 8px', color: 'var(--color-success)', fontWeight: 700 }}>11</td>
              <td style={{ padding: '12px 8px', color: 'var(--color-success)', fontWeight: 700 }}>-</td>
              <td style={{ padding: '12px 8px', color: 'var(--color-success)', fontWeight: 700 }}>1</td>
              
              <td style={{ padding: '12px 8px', color: 'var(--color-warning)', fontWeight: 700 }}>20</td>
              
              <td style={{ padding: '12px 8px', color: '#818cf8', fontWeight: 700 }}>18</td>
              <td style={{ padding: '12px 8px', color: '#818cf8', fontWeight: 700 }}>-</td>
              
              <td style={{ padding: '12px 8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>4</td>
              <td style={{ padding: '12px 8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>9</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', textAlign: 'right' }}>
        ※ 오채: 오징어채낚기 / 오꽁: 꽁치봉수망·오징어채낚기 겸업선 / 저연: 저연승 / 통저: 통발·저연승 겸업
      </div>
    </div>
  );
}
