import React, { useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/useMobile';

interface ScrollableModalProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableModal({ children, className = "" }: ScrollableModalProps) {
  const isMobile = useMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !isMobile) return;

    // Enhanced touch scrolling for mobile
    const handleTouchStart = (e: TouchEvent) => {
      // Allow normal touch behavior
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent parent scroll interference
      e.stopPropagation();
    };

    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile]);

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth',
        // iOS-specific fixes
        transform: 'translate3d(0, 0, 0)',
        willChange: 'scroll-position'
      }}
    >
      {children}
    </div>
  );
}