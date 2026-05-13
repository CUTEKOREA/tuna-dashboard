'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile viewport and return responsive chart config.
 * Used by all Recharts components for consistent mobile rendering.
 */
export function useResponsiveChart() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth <= 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return {
    isMobile,
    isTablet,
    // Chart heights
    chartHeight: isMobile ? 220 : isTablet ? 260 : 300,
    mainChartHeight: isMobile ? 250 : isTablet ? 320 : 400,
    smallChartHeight: isMobile ? 180 : isTablet ? 220 : 250,
    // Font sizes
    tickFontSize: isMobile ? 8 : isTablet ? 9 : 11,
    legendFontSize: isMobile ? '9px' : isTablet ? '10px' : '12px',
    // Margins
    chartMargin: isMobile
      ? { top: 10, right: 5, left: -15, bottom: 5 }
      : isTablet
      ? { top: 15, right: 15, left: -5, bottom: 10 }
      : { top: 20, right: 30, left: 0, bottom: 20 },
    mainChartMargin: isMobile
      ? { top: 10, right: 10, left: -10, bottom: 5 }
      : isTablet
      ? { top: 15, right: 30, left: 0, bottom: 15 }
      : { top: 20, right: 60, bottom: 20, left: 10 },
    // XAxis config
    xAxisInterval: isMobile ? 1 : 0,  // Skip every other label on mobile
    xAxisAngle: isMobile ? -45 : 0,
    xAxisDy: isMobile ? 8 : 0,
    // Bar size
    barSize: isMobile ? 12 : isTablet ? 16 : 20,
  };
}
