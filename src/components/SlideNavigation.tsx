'use client';

import { useEffect, useState } from 'react';

interface SlideNavigationProps {
  onSlideChange: (slideIndex: number) => void;
}

export default function SlideNavigation({ onSlideChange }: SlideNavigationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ['Hero', 'Services', 'Portfolio', 'Contact'];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const slideIndex = Math.round(scrollPosition / viewportHeight);
      setCurrentSlide(Math.min(slideIndex, slides.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slides.length]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    onSlideChange(index);
  };

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
      <div className="flex flex-col gap-3">
        {slides.map((slide, index) => (
          <div key={slide} className="group relative flex items-center justify-center">
            <button
              onClick={() => handleSlideClick(index)}
              className={`w-3 h-3 rounded-full ${currentSlide === index
                  ? 'bg-accent scale-125'
                  : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
              style={{ 
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label={`Go to ${slide} section`}
            />
            {/* Tooltip */}
            <div 
              className="absolute right-6 px-3 py-2 bg-accent text-background text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg"
              style={{ 
                transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              {slide}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
