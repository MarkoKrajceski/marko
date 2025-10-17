// Static exports for critical components (above the fold)
export { default as Hero } from './Hero';
export * from './Icons';

// Dynamic imports for non-critical components (below the fold)
import dynamic from 'next/dynamic';

export const WhatIDo = dynamic(() => import('./WhatIDo'), {
  loading: () => <div className="animate-pulse bg-zinc-800 h-96 rounded-lg" />,
});

export const LiveDemo = dynamic(() => import('./LiveDemo'), {
  loading: () => <div className="animate-pulse bg-zinc-800 h-64 rounded-lg" />,
});

export const Contact = dynamic(() => import('./Contact'), {
  loading: () => <div className="animate-pulse bg-zinc-800 h-96 rounded-lg" />,
});

// Client-side only components
export const CustomCursor = dynamic(() => import('./CustomCursor'));

export const ParticleBackground = dynamic(() => import('./ParticleBackground'));

export const ScrollIndicator = dynamic(() => import('./ScrollIndicator'));

export const SlideNavigation = dynamic(() => import('./SlideNavigation'));

export const Footer = dynamic(() => import('./Footer'));