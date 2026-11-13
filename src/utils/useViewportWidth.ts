import { useState, useEffect } from 'react';
import { getViewportCategory, ViewportCategory } from './responsiveLayout';

export function useViewportWidth() {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const category: ViewportCategory = getViewportCategory(width);

  return {
    viewportWidth: width,
    viewportCategory: category,
    isMobile: category === 'mobile',
    isTablet: category === 'tablet',
    isDesktop: category === 'desktop',
  };
}
