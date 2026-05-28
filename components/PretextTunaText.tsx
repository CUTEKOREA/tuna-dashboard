'use client';

import React, { useEffect, useRef, useState } from 'react';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

interface PretextTunaTextProps {
  text: string;
  font?: string;
  lineHeight?: number;
}

export default function PretextTunaText({
  text,
  font = '16px "Noto Sans KR", Pretendard, sans-serif',
  lineHeight = 28,
}: PretextTunaTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 800, // Estimate height initially
        });
      }
    };
    
    // Slight delay to ensure fonts/layout are loaded
    setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use High-DPI screen resolution
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cw = dimensions.width;
    
    // We don't know the exact final height until we measure, 
    // but we will calculate it using pretext.
    
    canvas.width = cw * dpr;
    canvas.style.width = `${cw}px`;
    
    // Initialize pretext
    let prepared: any = null;
    try {
      prepared = prepareWithSegments(text, font);
    } catch (e: any) {
      console.warn("Pretext prepare failed (Canvas API required).", e);
      return;
    }

    // Measure base height without tuna
    let baseHeight = 0;
    let tempCursor = { segmentIndex: 0, graphemeIndex: 0 };
    while (true) {
      const line = layoutNextLine(prepared, tempCursor, cw);
      if (!line) break;
      baseHeight += lineHeight;
      tempCursor = line.end;
    }
    
    // Allocate enough Canvas height for the text to wrap around the tuna internally
    // without it clipping. But keep the HTML wrapper tightly bound to the baseHeight!
    const canvasOverflowHeight = Math.max(baseHeight * 2.5, 150);

    // Canvas needs literal height to draw pixels
    canvas.height = canvasOverflowHeight * dpr;
    canvas.style.height = `${canvasOverflowHeight}px`;
    
    // The wrapper stays compact, preventing the huge empty gap
    if (containerRef.current) {
      containerRef.current.style.height = `${baseHeight}px`;
    }
    ctx.scale(dpr, dpr);

    let animationId: number;
    let requiredHeight = 0;

    const render = () => {
      // 1. Clear Canvas
      ctx.clearRect(0, 0, cw, canvasOverflowHeight);
      
      // Setup Text style
      ctx.font = font;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Text color
      ctx.textBaseline = 'top';

      // 2. Fetch Tuna Position from the CSS Custom Properties
      // We read this directly from styles updated by SwimmingTuna.tsx
      const rootStyle = getComputedStyle(document.documentElement);
      const rawX = parseFloat(rootStyle.getPropertyValue('--tuna-x') || '-1000');
      const rawY = parseFloat(rootStyle.getPropertyValue('--tuna-y') || '-1000');

      // Transform absolute screen position of tuna to Canvas local coordinates
      const rect = canvas.getBoundingClientRect();
      const localTunaX = rawX - rect.left;
      const localTunaY = rawY - rect.top;

      // Exclusion Zone (Tuna Radius) - we use an ellipse for the tuna 
      // Tuna is 1200x480, but the core body blocking text is smaller. 
      // Let's use a dynamic radius (250px horizontally, 120px vertically)
      const ERX = 280; // Exclusion Radius X
      const ERY = 120; // Exclusion Radius Y

      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let y = 0;

      // 3. Layout loop
      while (true) {
        // Find x-intersection points for the current line's y coordinate
        // Ellipse equation: (x-cx)^2 / ERX^2 + (y-cy)^2 / ERY^2 = 1
        // We find the chord length at this specific y.
        const dy = y - localTunaY;
        
        const availableSegments: {x: number, width: number}[] = [];
        
        if (Math.abs(dy) < ERY) {
          // Line intersects the tuna!
          // Calculate chord half-width (dx)
          const dx = ERX * Math.sqrt(1 - (dy * dy) / (ERY * ERY));
          
          const leftBound = localTunaX - dx;
          const rightBound = localTunaX + dx;

          // Segment 1: Left of the tuna
          if (leftBound > 0) {
            availableSegments.push({ x: 0, width: Math.min(leftBound, cw) });
          }
          
          // Segment 2: Right of the tuna
          if (rightBound < cw) {
            availableSegments.push({ x: Math.max(0, rightBound), width: cw - Math.max(0, rightBound) });
          }
        } else {
          // No intersection, full width available
          availableSegments.push({ x: 0, width: cw });
        }

        let lineComplete = false;

        for (const seg of availableSegments) {
          if (seg.width < 50) continue; // Too narrow to put a word, skip to next segment
          
          const line = layoutNextLine(prepared, cursor, seg.width);
          if (!line) {
            lineComplete = true; // No more text
            break;
          }
          
          // Slight glow/opacity adjustment based on proximity to tuna (optional water effect)
          ctx.fillText(line.text, seg.x, y);
          cursor = line.end;
        }

        y += lineHeight;

        if (lineComplete) break;
      }
      requiredHeight = y;
      
      // Render continuously to animate text parting
      animationId = requestAnimationFrame(render);
    };

    // Begin Animation Loop
    animationId = requestAnimationFrame(render);
    
    return () => cancelAnimationFrame(animationId);
  }, [text, font, lineHeight, dimensions.width]); // Re-bind on resize

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
}
