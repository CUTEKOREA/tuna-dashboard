import { useState, useEffect } from 'react';

export default function useContainerWidth() {
  const [width, setWidth] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(containerRef);
    return () => observer.disconnect();
  }, [containerRef]);

  return { containerRef: setContainerRef, width };
}
