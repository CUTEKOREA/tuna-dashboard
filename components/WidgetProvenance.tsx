'use client';

/**
 * WidgetProvenance — 위젯 숫자의 출처·등급·재현 경로를 3초 안에 읽게 하는 렌더 계층.
 *
 * 접힘 상태는 한 줄 요약(등급 배지 + 게시기관 + 시리즈 + 기간 + 수집일),
 * 클릭 시 입력 파일·SHA-256·rebuild 커맨드·note 상세를 펼친다.
 * grade C는 '추정', manual_extract는 '수동추출' 라벨을 강제해
 * 파생값이 실측인 척 보이는 것을 막는다.
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TermTooltip from './TermTooltip';

export interface ProvenanceData {
  source_id: string;
  publisher: string;
  series: string;
  period: string;
  extract_date: string;
  input_files: string[];
  input_sha256: string[];
  method: 'script' | 'manual_extract' | 'api_live';
  grade: 'A' | 'B' | 'C';
  rebuild: string;
  note?: string;
}

const GRADE_COLORS: Record<ProvenanceData['grade'], string> = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#ef4444',
};

const GRADE_MEANINGS: Record<ProvenanceData['grade'], string> = {
  A: 'A - 1차출처를 스크립트로 기계 추출. 재실행하면 같은 값이 나온다.',
  B: 'B - 1차출처지만 PDF 등에서 수동 추출. 재현에 사람 손이 필요하다.',
  C: 'C - 추정·시뮬레이션 또는 2차출처. 가정이 바뀌면 값이 바뀐다.',
};

function labelChip(text: string, color: string): React.ReactNode {
  return (
    <span
      style={{
        color,
        border: `1px solid ${color}66`,
        background: `${color}1a`,
        borderRadius: '4px',
        padding: '0 5px',
        fontSize: '0.62rem',
        fontWeight: 700,
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
        lineHeight: '16px',
      }}
    >
      {text}
    </span>
  );
}

const detailLabelStyle: React.CSSProperties = {
  color: 'var(--w-slate-500)',
  fontSize: '0.66rem',
  fontWeight: 600,
  letterSpacing: '0.4px',
  marginBottom: '3px',
};

const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.7rem',
  color: 'var(--w-slate-300)',
  wordBreak: 'break-all',
};

export default function WidgetProvenance({ provenance }: { provenance: ProvenanceData }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const gradeColor = GRADE_COLORS[provenance.grade];

  return (
    <div
      style={{
        marginTop: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--w-slate-400)',
          fontSize: '0.75rem',
          lineHeight: 1.5,
          textAlign: 'left',
        }}
      >
        <TermTooltip
          term={
            <span
              style={{
                color: gradeColor,
                border: `1px solid ${gradeColor}66`,
                background: `${gradeColor}1a`,
                borderRadius: '4px',
                padding: '0 6px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.68rem',
                fontWeight: 700,
                lineHeight: '17px',
                whiteSpace: 'nowrap',
              }}
            >
              {provenance.grade}
            </span>
          }
          description={GRADE_MEANINGS[provenance.grade]}
        />
        {provenance.grade === 'C' && labelChip('추정', '#ef4444')}
        {provenance.method === 'manual_extract' && labelChip('수동추출', '#f59e0b')}
        {provenance.method === 'api_live' && labelChip('실시간', '#22d3ee')}
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {provenance.publisher} · {provenance.series} · {provenance.period} · {provenance.extract_date} 수집
        </span>
        <ChevronDown
          size={14}
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        />
      </button>

      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px 12px 12px 12px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div>
            <div style={detailLabelStyle}>출처 ID</div>
            <div style={monoStyle}>{provenance.source_id}</div>
          </div>

          <div>
            <div style={detailLabelStyle}>입력 파일 ({provenance.input_files.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {provenance.input_files.map((file, index) => (
                <div key={`${file}-${index}`}>
                  <div style={monoStyle}>{file}</div>
                  {provenance.input_sha256[index] && (
                    <div style={{ ...monoStyle, color: 'var(--w-slate-500)' }}>
                      sha256 {provenance.input_sha256[index].slice(0, 12)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={detailLabelStyle}>재현 커맨드</div>
            <code
              style={{
                ...monoStyle,
                display: 'inline-block',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '4px',
                padding: '3px 7px',
              }}
            >
              {provenance.rebuild}
            </code>
          </div>

          {provenance.note ? (
            <div>
              <div style={detailLabelStyle}>노트</div>
              <div style={{ color: 'var(--w-slate-300)', fontSize: '0.72rem', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                {provenance.note}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
