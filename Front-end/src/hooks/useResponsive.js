import { useState, useEffect } from 'react';

const useResponsive = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // Returns 1fr on mobile, repeats on wider screens
  const gridCols = (desktop, tablet = null) => {
    if (isMobile) return '1fr';
    if (isTablet) return tablet ?? `repeat(${Math.min(desktop, 2)}, 1fr)`;
    return `repeat(${desktop}, 1fr)`;
  };

  const pagePadding = isMobile ? '16px' : isTablet ? '20px 24px' : '28px 32px';

  const modalWidth = (base = 600) =>
    isMobile ? 'calc(100vw - 32px)' : isTablet ? Math.min(base, 520) : base;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    gridCols,
    pagePadding,
    modalWidth,
  };
};

export default useResponsive;
