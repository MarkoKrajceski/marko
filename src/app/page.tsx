'use client';

import { useRef, useEffect } from 'react';
import { Hero, WhatIDo, Portfolio, Contact, ScrollIndicator, SlideNavigation, Footer } from '@/components';
import { ServiceCard } from '@/types';
import { CloudIcon, AutomationIcon, AIIcon, FullStackIcon } from '@/components/Icons';

export default function Home() {
  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const whatIDoRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Service data for What I Do section
  const services: ServiceCard[] = [
    {
      title: 'Cloud & Serverless',
      description: 'Build scalable, cost-effective solutions with AWS Lambda, API Gateway, and serverless architectures that scale automatically and reduce operational overhead.',
      icon: <CloudIcon className="w-12 h-12" />,
    },
    {
      title: 'Automation Pipelines',
      description: 'Design and implement CI/CD pipelines, infrastructure as code, and automated workflows that eliminate manual processes and reduce deployment risks.',
      icon: <AutomationIcon className="w-12 h-12" />,
    },
    {
      title: 'Applied AI',
      description: 'Integrate practical AI solutions into existing workflows, from intelligent automation to data processing, focusing on real business value over hype.',
      icon: <AIIcon className="w-12 h-12" />,
    },
    {
      title: 'Full-Stack Development',
      description: 'I own both sides of the stack — pixel-perfect frontend interfaces built with React and Next.js, paired with resilient backend APIs, databases, and infrastructure designed to scale without drama.',
      icon: <FullStackIcon className="w-12 h-12" />,
    },
  ];

  // Smooth scroll handlers
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToContact = () => scrollToSection(contactRef);
  const scrollToPortfolio = () => scrollToSection(portfolioRef);

  // Handle slide navigation
  const handleSlideChange = (slideIndex: number) => {
    const refs = [heroRef, whatIDoRef, portfolioRef, contactRef];
    scrollToSection(refs[slideIndex]);
  };

  // Restore scroll position to portfolio section when returning from a portfolio page
  useEffect(() => {
    if (sessionStorage.getItem('returnToPortfolio')) {
      sessionStorage.removeItem('returnToPortfolio');
      requestAnimationFrame(() => {
        portfolioRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    }
  }, []);

  // Add keyboard navigation for slides (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only enable keyboard navigation on desktop
      if (window.innerWidth < 1024) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentScroll = window.scrollY;
        const viewportHeight = window.innerHeight;
        const currentSlide = Math.round(currentScroll / viewportHeight);

        if (currentSlide === 0) scrollToSection(whatIDoRef);
        else if (currentSlide === 1) scrollToSection(portfolioRef);
        else if (currentSlide === 2) scrollToSection(contactRef);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentScroll = window.scrollY;
        const viewportHeight = window.innerHeight;
        const currentSlide = Math.round(currentScroll / viewportHeight);

        if (currentSlide === 3) scrollToSection(portfolioRef);
        else if (currentSlide === 2) scrollToSection(whatIDoRef);
        else if (currentSlide === 1) scrollToSection(heroRef);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollIndicator />

      {/* Slide Navigation */}
      <SlideNavigation onSlideChange={handleSlideChange} />

      <main id="main-content">
        {/* Hero Section - Slide 1 */}
        <div ref={heroRef} className="min-h-screen lg:h-screen lg:snap-start">
          <Hero onContactClick={scrollToContact} onPortfolioClick={scrollToPortfolio} />
        </div>

        {/* What I Do Section - Slide 2 */}
        <div ref={whatIDoRef} className="min-h-screen lg:h-screen lg:snap-start">
          <WhatIDo services={services} />
        </div>

        {/* Portfolio Section - Slide 3 */}
        <div ref={portfolioRef} className="min-h-screen lg:h-screen lg:snap-start">
          <Portfolio />
        </div>

        {/* Contact Section - Slide 4 */}
        <div ref={contactRef} id="contact" className="min-h-screen lg:h-screen lg:snap-start">
          <Contact />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
