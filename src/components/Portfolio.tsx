'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Project {
  slug: string;
  title: string;
  subtitle: string;
  gradient: string;
  previewElements: React.ReactNode;
}

// Deterministic pseudo-values (no Math.random — avoids hydration mismatch)
const KINETIC_BARS = [0.85, 0.42, 0.68, 0.33, 0.91, 0.55, 0.78, 0.47];

const projects: Project[] = [
  {
    slug: 'solarpunk',
    title: 'Solarpunk',
    subtitle: 'Eco-Futurism Dashboard',
    gradient: 'from-emerald-400 via-teal-500 to-green-600',
    previewElements: (
      <>
        <div className="absolute inset-0 opacity-25">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${24 + i * 14}px`,
                height: `${24 + i * 14}px`,
                background: 'radial-gradient(circle, rgba(16,185,129,0.7), transparent)',
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 22}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        <svg className="absolute bottom-0 left-0 w-full opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,80 Q50,40 100,60 T200,50 T300,70 T400,45 L400,100 L0,100 Z" fill="#10b981" />
          <path d="M0,90 Q80,60 150,75 T300,65 T400,80 L400,100 L0,100 Z" fill="#059669" />
        </svg>
      </>
    ),
  },
  {
    slug: 'synthwave',
    title: 'Synthwave',
    subtitle: 'Retro Neon Experience',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    previewElements: (
      <>
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, transparent 0%, rgba(232,121,249,0.15) 100%),
                repeating-linear-gradient(90deg, rgba(232,121,249,0.25) 0px, rgba(232,121,249,0.25) 1px, transparent 1px, transparent 28px),
                repeating-linear-gradient(0deg, rgba(232,121,249,0.18) 0px, rgba(232,121,249,0.18) 1px, transparent 1px, transparent 28px)
              `,
            }}
          />
          <div
            className="absolute top-[25%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fb923c 0%, #e879f9 55%, transparent 72%)',
              filter: 'blur(6px)',
            }}
          />
        </div>
        <div className="absolute top-3 right-3 font-mono text-[9px] text-purple-200/60 tracking-[0.3em]">
          1 9 8 5
        </div>
      </>
    ),
  },
  {
    slug: 'kinetic',
    title: 'Kinetic',
    subtitle: 'Motion Typography',
    gradient: 'from-zinc-800 via-neutral-700 to-stone-600',
    previewElements: (
      <>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-25">
          {['MOVE', 'TYPE', 'FLOW'].map((word, i) => (
            <span
              key={word}
              className="text-xl sm:text-2xl font-black tracking-tighter text-white"
              style={{
                transform: `translateX(${(i - 1) * 14}px)`,
                opacity: 0.35 + i * 0.2,
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex gap-1">
          {KINETIC_BARS.map((scale, i) => (
            <div
              key={i}
              className="h-[2px] flex-1 bg-white/25 rounded"
              style={{ transform: `scaleX(${scale})` }}
            />
          ))}
        </div>
      </>
    ),
  },
  {
    slug: 'glass',
    title: 'Glass',
    subtitle: '3D Glassmorphism UI',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    previewElements: (
      <>
        <div className="absolute inset-0 opacity-50">
          <div
            className="absolute top-[18%] left-[15%] w-14 h-10 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.28)',
              transform: 'perspective(500px) rotateY(-6deg) rotateX(5deg)',
            }}
          />
          <div
            className="absolute top-[36%] right-[18%] w-12 h-9 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.22)',
              transform: 'perspective(500px) rotateY(8deg) rotateX(-3deg)',
            }}
          />
          <div
            className="absolute bottom-[22%] left-[28%] w-16 h-7 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.24)',
              transform: 'perspective(500px) rotateY(-3deg) rotateX(7deg)',
            }}
          />
        </div>
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, #38bdf8, #818cf8, transparent)',
            filter: 'blur(3px)',
          }}
        />
      </>
    ),
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/portfolio/${project.slug}`}
      onClick={() => sessionStorage.setItem('returnToPortfolio', 'true')}
      className={`group relative block overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        aspectRatio: '16/10',
      }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />

      {/* Preview elements */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
        {project.previewElements}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
        <div className="transform transition-transform duration-300 group-hover:translate-y-[-2px]">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 drop-shadow-lg">
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/75 font-medium tracking-wide">
            {project.subtitle}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
        }}
      />
    </Link>
  );
}

export default function Portfolio() {
  return (
    <section
      className="min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0"
      aria-labelledby="portfolio-heading"
    >
      <div className="max-w-5xl w-full mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 lg:mb-10">
          <h2
            id="portfolio-heading"
            className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
          >
            Portfolio
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
            Standalone frontend showcases — each exploring a different design language.
          </p>
        </div>

        {/* Project grid — 2x2 on all viewports above sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
