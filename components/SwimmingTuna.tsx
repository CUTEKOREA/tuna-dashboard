'use client';
import Image from 'next/image';
import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import styles from './SwimmingTuna.module.css';

const subscribeClientReady = () => () => {};
const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;

export default function SwimmingTuna() {
  const tunaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mounted = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationId: number;
    const startTime = performance.now();

    // ── Random start position for each mount ──
    // Spread across 20-80% of viewport so it feels different every time
    let prevX = window.innerWidth * (0.2 + Math.random() * 0.6);
    let prevY = window.innerHeight * (0.15 + Math.random() * 0.5);

    const animate = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const elapsed = time - startTime;

      // ── Natural ocean swimming path ──
      // Primary: slow horizontal oscillation across full screen
      // Secondary: gentle vertical wave with multiple sine harmonics for realism
      // Tertiary: subtle micro-drift for "current" feel
      const slowElapsed = elapsed * 0.45; // Slow down all movements
      // Amplitude exceeds viewport by 500px on each side → tuna exits fully before turning
      const baseX = Math.sin(slowElapsed * 0.00008) * (w / 2 + 500) + (w / 2);
      const driftX = Math.sin(slowElapsed * 0.00023) * 30; // micro current

      const baseY = Math.sin(slowElapsed * 0.00018) * (h * 0.18) + (h * 0.35);
      const waveY = Math.cos(slowElapsed * 0.00031) * 25; // secondary swell
      const driftY = Math.sin(slowElapsed * 0.00057) * 12; // tiny bobbing

      const rawX = baseX + driftX;
      const rawY = baseY + waveY + driftY;

      // ── Smooth heading calculation ──
      // Use delta from previous frame for stable direction
      const dx = rawX - prevX;
      const dy = rawY - prevY;

      // Angle of the heading (the fish tilts slightly in swim direction)
      // Clamp the tilt to ±15° so the fish doesn't rotate wildly
      const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const clampedAngle = Math.max(-15, Math.min(15, rawAngle));

      // ── Determine facing direction ──
      // Fish image faces LEFT by default.
      // When dx > 0, fish moves right → flip horizontally so head leads.
      const isMovingRight = dx > 0;

      if (tunaRef.current) {
        // Center the wrapper on the fish position (offset by half size: 1200x480)
        const tx = rawX - 600;
        const ty = rawY - 240;

        if (isMovingRight) {
          // Flip horizontally to face right, negate angle so tilt stays natural
          tunaRef.current.style.transform =
            `translate3d(${tx}px, ${ty}px, 0) scaleX(-1) rotate(${-clampedAngle}deg)`;
        } else {
          // Keep default left-facing direction
          tunaRef.current.style.transform =
            `translate3d(${tx}px, ${ty}px, 0) rotate(${clampedAngle}deg)`;
        }

        // Broadcast for optional water-glow CSS effects elsewhere
        document.documentElement.style.setProperty('--tuna-x', `${rawX}px`);
        document.documentElement.style.setProperty('--tuna-y', `${rawY}px`);
      }

      // ── "Living Fish" Organic Body Flexing Effect ──
      // This applies to the fish image itself: simulating tail flap and muscle flex
      if (imgRef.current) {
        // Massive fish move very slowly. Slow down the body cycle significantly.
        // slowElapsed is ~400 per second.
        const bodyFlexCycle = slowElapsed * 0.0015; // Slow, majestic tail flutter (~ 1 flap every 4-5 seconds)
        
        // 1. rotateY: Very subtle tail flap (±4 degrees 3D depth)
        const flapY = Math.sin(bodyFlexCycle) * 4;     
        // 2. scale: Extremely subtle breathing/muscle squeeze (±1% belly flex)
        const stretchX = 1 + Math.sin(bodyFlexCycle * 1.5) * 0.01; 
        const stretchY = 1 + Math.cos(bodyFlexCycle * 1.5) * 0.01; 

        // Apply a gentle 3D easing that doesn't distort the high-res 2D image too much
        imgRef.current.style.transform = 
          `perspective(2000px) rotateY(${flapY}deg) scale3d(${stretchX}, ${stretchY}, 1)`;
      }

      prevX = rawX;
      prevY = rawY;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.tunaWrapper} ref={tunaRef}>
      {/* Invisible SVG filter definition for true water ripple displacement */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id="water-ripple">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.015;0.025;0.015" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </svg>
      
      {/* Backdrop-filter area that creates textual distortion */}
      <div className={styles.tunaDistortion}></div>

      {/* Subtle ocean glow aura behind the fish */}
      <div className={styles.tunaGlow}></div>
      {/* Real photograph — transparent PNG */}
      <Image
        onLoad={(event) => {
          imgRef.current = event.currentTarget;
        }}
        src="/southern-bluefin-tuna.png"
        alt="Southern Bluefin Tuna"
        width={1200}
        height={480}
        className={styles.tunaImage}
        draggable={false}
      />
    </div>,
    document.body
  );
}
