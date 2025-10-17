'use client';

import { HeroProps } from '@/types';
import ParticleBackground from './ParticleBackground';

export default function Hero({ onDemoClick, onContactClick }: HeroProps) {
  return (
    <section className="relative min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-8 lg:py-0">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Tagline */}
        <div className="mb-8 animate-fade-in">
          <span className="inline-block px-4 py-2 text-sm font-medium tracking-wider text-accent border border-accent/20 rounded-full bg-accent/5 backdrop-blur-sm">
            AI • CLOUD • AUTOMATION
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up animation-delay-200">
          <span className="block text-foreground">I automate the boring</span>
          <span className="block text-accent">and scale the bold</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-400">
          I am Marko Krajcheski, a full-stack developer and cloud consultant. I ship fast, keep it simple, and instrument everything.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600 mb-8 lg:mb-16">
          <button
            onClick={onDemoClick}
            className="group relative px-8 py-4 bg-accent text-background font-semibold rounded-lg transition-all duration-300 hover:bg-accent/90 hover:scale-105 hover:shadow-lg hover:shadow-accent/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="relative z-10">Speak with Marko AI</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button
            onClick={onContactClick}
            className="group px-8 py-4 border-2 border-foreground/20 text-foreground font-semibold rounded-lg transition-all duration-300 hover:border-accent hover:text-accent hover:scale-105 hover:shadow-lg hover:shadow-foreground/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="relative z-10">Get in Touch</span>
          </button>
        </div>

        {/* Scroll Hint - Only show on desktop */}
        <div className="animate-fade-in-up animation-delay-800 hidden lg:block">
          <div className="flex flex-col items-center text-muted">
            <p className="text-sm mb-2">Scroll or use ↓ ↑ keys to navigate</p>
            <div className="w-6 h-10 border-2 border-muted/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-muted/50 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Particle background */}
        <ParticleBackground />

        {/* Subtle background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-2xl animate-pulse-slow animation-delay-1000" />
        </div>
      </div>
    </section>
  );
}