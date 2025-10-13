'use client';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: 'sm' | 'md' | 'lg';
}

export default function LoadingSkeleton({ 
  className = '', 
  lines = 3, 
  height = 'md' 
}: LoadingSkeletonProps) {
  const heightClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-foreground/10 rounded animate-shimmer ${heightClasses[height]} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton for service cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-background border border-foreground/10 rounded-xl ${className}`}>
      <div className="animate-shimmer bg-foreground/10 w-12 h-12 rounded-lg mb-6" />
      <div className="animate-shimmer bg-foreground/10 h-6 w-3/4 rounded mb-4 animation-delay-100" />
      <div className="space-y-2">
        <div className="animate-shimmer bg-foreground/10 h-4 w-full rounded animation-delay-200" />
        <div className="animate-shimmer bg-foreground/10 h-4 w-5/6 rounded animation-delay-300" />
        <div className="animate-shimmer bg-foreground/10 h-4 w-4/5 rounded animation-delay-400" />
      </div>
    </div>
  );
}

// Button skeleton
export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer bg-foreground/10 h-12 w-32 rounded-lg ${className}`} />
  );
}