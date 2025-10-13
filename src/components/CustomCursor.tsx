'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;

    const updateCursor = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      // Use requestAnimationFrame for smooth positioning
      animationId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
      
      const target = e.target as HTMLElement;
      const isClickable = target.tagName === 'BUTTON' || 
                         target.tagName === 'A' || 
                         target.closest('button') || 
                         target.closest('a') ||
                         target.style.cursor === 'pointer' ||
                         window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(!!isClickable);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Only show on desktop devices
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    };
    
    checkDesktop();
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    mediaQuery.addEventListener('change', checkDesktop);
    
    return () => mediaQuery.removeEventListener('change', checkDesktop);
  }, []);

  if (!isDesktop || !isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{
        transform: `translate3d(${position.x - 10}px, ${position.y - 10}px, 0)`,
        transition: 'none', // Remove transitions to prevent jittery movement
      }}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 transition-colors duration-150 ${
          isPointer 
            ? 'border-accent bg-accent/20 scale-150' 
            : 'border-foreground/30 bg-transparent scale-100'
        }`}
        style={{
          transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
        }}
      />
    </div>
  );
}