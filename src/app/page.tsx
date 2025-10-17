'use client';

import { useRef, useEffect } from 'react';
import { Hero, WhatIDo, LiveDemo, Contact, ScrollIndicator, SlideNavigation, Footer } from '@/components';
import { ServiceCard } from '@/types';
import { CloudIcon, AutomationIcon, AIIcon } from '@/components/Icons';

export default function Home() {
  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const whatIDoRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
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
  ];

  // Smooth scroll handlers
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToDemo = () => scrollToSection(demoRef);
  const scrollToContact = () => scrollToSection(contactRef);

  // Handle slide navigation
  const handleSlideChange = (slideIndex: number) => {
    const refs = [heroRef, whatIDoRef, demoRef, contactRef];
    scrollToSection(refs[slideIndex]);
  };

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
        else if (currentSlide === 1) scrollToSection(demoRef);
        else if (currentSlide === 2) scrollToSection(contactRef);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentScroll = window.scrollY;
        const viewportHeight = window.innerHeight;
        const currentSlide = Math.round(currentScroll / viewportHeight);
        
        if (currentSlide === 3) scrollToSection(demoRef);
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

      {/* Hero Section - Slide 1 */}
      <div ref={heroRef} className="min-h-screen lg:h-screen lg:snap-start">
        <Hero onDemoClick={scrollToDemo} onContactClick={scrollToContact} />
      </div>

      {/* What I Do Section - Slide 2 */}
      <div ref={whatIDoRef} className="min-h-screen lg:h-screen lg:snap-start">
        <WhatIDo services={services} />
      </div>

      {/* Live Demo Section - Slide 3 */}
      <div ref={demoRef} id="demo" className="min-h-screen lg:h-screen lg:snap-start">
        <LiveDemo />
      </div>

      {/* Contact Section - Slide 4 */}
      <div ref={contactRef} id="contact" className="min-h-screen lg:h-screen lg:snap-start">
        <Contact />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
