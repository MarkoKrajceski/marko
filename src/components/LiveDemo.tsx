'use client';

import { useState } from 'react';
import { LiveDemoProps, DemoState, PitchRequest, PitchResponse } from '@/types';
import { CopyIcon, CheckIcon, LoadingIcon, InfoIcon } from './Icons';

export default function LiveDemo({ className = '' }: LiveDemoProps) {
  const [state, setState] = useState<DemoState>({
    role: '',
    focus: '',
    loading: false,
    result: null,
    error: null,
  });

  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const roles = [
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'cto', label: 'CTO' },
    { value: 'product', label: 'Product Manager' },
    { value: 'founder', label: 'Founder' },
  ] as const;

  const focuses = [
    { value: 'ai', label: 'Applied AI' },
    { value: 'cloud', label: 'Cloud & Serverless' },
    { value: 'automation', label: 'Automation Pipelines' },
  ] as const;

  const handleRoleChange = (role: DemoState['role']) => {
    setState(prev => ({ ...prev, role, focus: '', result: null, error: null }));
  };

  const handleFocusChange = (focus: DemoState['focus']) => {
    setState(prev => ({ ...prev, focus, result: null, error: null }));
  };

  const generatePitch = async () => {
    if (!state.role || !state.focus) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: PitchRequest = {
        role: state.role as PitchRequest['role'],
        focus: state.focus as PitchRequest['focus'],
      };

      const response = await fetch('/api/pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate pitch');
      }

      const result: PitchResponse = await response.json();
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Something went wrong',
        loading: false,
      }));
    }
  };

  const copyToClipboard = async () => {
    if (!state.result?.pitch) return;

    try {
      await navigator.clipboard.writeText(state.result.pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const retry = () => {
    setState(prev => ({ ...prev, error: null }));
    generatePitch();
  };

  const isFormValid = state.role && state.focus;

  return (
    <section className={`min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0 ${className}`}>
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Live Demo
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-3 leading-relaxed">
            See how I tailor my pitch based on your role and interests. This hits a real AWS Lambda function.
          </p>

          {/* Tooltip */}
          <div className="relative inline-block">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-foreground/5"
              aria-label="Information about data retention"
            >
              <InfoIcon className="w-4 h-4" />
              Data retention info
            </button>

            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-foreground text-background text-sm rounded-lg whitespace-nowrap shadow-xl border border-foreground/20">
                This hits a real AWS Lambda and stores anonymized analytics for 7 days
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Demo Widget */}
        <div className="bg-background border border-foreground/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-foreground/5">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-10">
            {/* Role Selection */}
            <div className="space-y-2 lg:space-y-3">
              <label htmlFor="role-select" className="block text-sm font-semibold text-foreground">
                Your Role
              </label>
              <select
                id="role-select"
                value={state.role}
                onChange={(e) => handleRoleChange(e.target.value as DemoState['role'])}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-background border border-foreground/20 rounded-xl text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 hover:border-foreground/30"
                aria-describedby="role-help"
              >
                <option value="">Select your role...</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p id="role-help" className="text-sm text-muted leading-relaxed">
                This helps tailor the pitch to your perspective
              </p>
            </div>

            {/* Focus Selection */}
            <div className="space-y-2 lg:space-y-3">
              <label htmlFor="focus-select" className="block text-sm font-semibold text-foreground">
                Area of Interest
              </label>
              <select
                id="focus-select"
                value={state.focus}
                onChange={(e) => handleFocusChange(e.target.value as DemoState['focus'])}
                disabled={!state.role}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-background border border-foreground/20 rounded-xl text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-foreground/20"
                aria-describedby="focus-help"
              >
                <option value="">Select focus area...</option>
                {focuses.map((focus) => (
                  <option key={focus.value} value={focus.value}>
                    {focus.label}
                  </option>
                ))}
              </select>
              <p id="focus-help" className="text-sm text-muted leading-relaxed">
                What aspect of my work interests you most?
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-4 lg:mb-6">
            <button
              onClick={generatePitch}
              disabled={!isFormValid || state.loading}
              className="inline-flex items-center gap-3 px-8 lg:px-10 py-3 lg:py-4 bg-accent text-background font-semibold rounded-xl transition-all duration-300 hover:bg-accent/90 hover:scale-105 hover:shadow-lg hover:shadow-accent/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-base lg:text-lg"
              aria-describedby="generate-help"
            >
              {state.loading ? (
                <>
                  <LoadingIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                  Generating...
                </>
              ) : (
                'Generate Pitch'
              )}
            </button>
            <p id="generate-help" className="mt-2 text-sm text-muted">
              Calls a real Lambda function on AWS
            </p>
          </div>

          {/* Results */}
          {state.result && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-8 animate-fade-in">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Generated Pitch</h3>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-lg hover:bg-accent/10"
                  aria-label="Copy pitch to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-foreground leading-relaxed text-lg mb-6">
                {state.result.pitch}
              </p>

              <div className="flex items-center justify-between text-sm text-muted pt-4 border-t border-accent/10">
                <span>Confidence: {Math.round(state.result.confidence * 100)}%</span>
                <span>Generated: {new Date(state.result.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 animate-fade-in">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Oops! Something went wrong</h3>
                <p className="text-red-300 text-lg leading-relaxed">{state.error}</p>
              </div>
              <button
                onClick={retry}
                className="px-6 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}