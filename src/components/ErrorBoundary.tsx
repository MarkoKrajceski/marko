'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      const resetHandler = () => this.setState({ hasError: false });
      
      return (
        <FallbackComponent 
          {...(this.state.error && { error: this.state.error })}
          reset={resetHandler}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; reset: () => void }> = ({ error, reset }) => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-red-300 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default ErrorBoundary;