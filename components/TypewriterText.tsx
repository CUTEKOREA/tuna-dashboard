'use client';

import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, delay = 0, speed = 25 }: { text: string; delay?: number; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  return (
    <span>
      {displayedText}
      {hasStarted && displayedText.length < text.length && (
        <span style={{ 
          display: 'inline-block', 
          width: '6px', 
          height: '12px', 
          backgroundColor: 'var(--color-info)', 
          marginLeft: '4px',
          verticalAlign: 'baseline',
          animation: 'blink 0.8s step-end infinite' 
        }}></span>
      )}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
