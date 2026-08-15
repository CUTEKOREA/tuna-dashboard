'use client';

import React from 'react';

interface HarborBannerProps {
  vesselName: string;
  totalAmount: number;
  remainingAmount: number;
}

export default function HarborBanner({ vesselName, totalAmount, remainingAmount }: HarborBannerProps) {
  const progress = totalAmount > 0 ? ((totalAmount - Math.max(0, remainingAmount)) / totalAmount) * 100 : 0;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '200px',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '24px',
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px'
    }}>
      {/* Background Image with Parallax / Panning effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/assets/images/harbor_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 70%',
        filter: 'brightness(0.7) contrast(1.1)',
        zIndex: 0,
        animation: 'pan-bg 60s linear infinite alternate'
      }} />

      {/* Retro Scanline Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 6px 100%',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'var(--w-amber-400)',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            marginBottom: '8px',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            CURRENT OPERATION
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            color: '#fff',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            fontFamily: '"Courier New", Courier, monospace',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            {vesselName}
          </h2>
        </div>

        {/* Pixel Progress Bar */}
        <div style={{
          width: '40%',
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid #475569',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--w-slate-400)', fontSize: '0.8rem', marginBottom: '8px', fontFamily: 'monospace' }}>
            <span>UNLOADING PROGRESS</span>
            <span style={{ color: 'var(--w-emerald-500)' }}>{progress.toFixed(1)}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '24px',
            background: 'var(--w-navy-900)',
            border: '2px solid #0a0f1f',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 2,
              left: 2,
              bottom: 2,
              width: `calc(${progress}% - 4px)`,
              background: 'linear-gradient(to bottom, var(--w-emerald-400) 0%, var(--w-emerald-500) 50%, #059669 100%)',
              transition: 'width 1s ease-in-out',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--w-slate-500)', fontSize: '0.75rem', marginTop: '6px', fontFamily: 'monospace' }}>
            <span>0 MT</span>
            <span>REMAINING: {Math.max(0, remainingAmount).toLocaleString()} MT</span>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pan-bg {
          0% { background-position: 0% 70%; }
          100% { background-position: 100% 70%; }
        }
      `}} />
    </div>
  );
}
