'use client';

import { useEffect, useState } from 'react';

interface SlideNavigationProps {
  onSlideChange: (slideIndex: number) => void;
}

export default function SlideNavigation({ onSlideChange }: SlideNavigationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ['Hero', 'Services', 'Demo', 'Contact'];

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
          <button
            key={slide}
            onClick={() => handleSlideClick(index)}
            className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-accent scale-125'
                : 'bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={`Go to ${slide} section`}
          >
            {/* Tooltip */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-2 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {slide}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}