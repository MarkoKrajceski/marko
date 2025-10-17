'use client';

import { useState, useEffect } from 'react';
import { LiveDemoProps, DemoState, PitchRequest, PitchResponse } from '@/types';
import { CopyIcon, CheckIcon, LoadingIcon, InfoIcon } from './Icons';

export default function MarkoAI({ className = '' }: LiveDemoProps) {
  const [state, setState] = useState<DemoState>({
    role: '',
    query: '',
    loading: false,
    result: null,
    error: null,
  });

  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const roles = [
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'cto', label: 'CTO' },
    { value: 'product', label: 'Product Manager' },
    { value: 'founder', label: 'Founder' },
    { value: 'other', label: 'Other' },
  ] as const;

  const quickPrompts = [
    "How many years of experience do you have with React?",
    "Tell me about your experience with AI and machine learning",
    "What cloud architectures have you worked with?",
    "Can you help with a startup technical strategy?",
  ];

  const handleRoleChange = (role: DemoState['role']) => {
    setState(prev => ({ ...prev, role, result: null, error: null }));
  };

  const handleQueryChange = (query: string) => {
    setState(prev => ({ ...prev, query, result: null, error: null }));
  };

  const handleQuickPrompt = (prompt: string) => {
    setState(prev => ({ ...prev, query: prompt, result: null, error: null }));
  };

  // Format markdown text to HTML
  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/\n/g, '<br />'); // Line breaks
  };

  const generatePitch = async () => {
    if (!state.role || !state.query.trim()) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: PitchRequest = {
        role: state.role as PitchRequest['role'],
        query: state.query.trim(),
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
      setShowModal(true); // Show modal when response is received
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

  const closeModal = () => {
    setShowModal(false);
    setCopied(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const retry = () => {
    setState(prev => ({ ...prev, error: null }));
    generatePitch();
  };

  const isFormValid = state.role && state.query.trim();

  return (
    <section className={`min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0 ${className}`}>
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-7">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Marko AI
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-3 leading-relaxed">
            Check if I&apos;m the right person for you. Ask me anything about my experience and expertise.
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
                Logs are stored in CloudWatch for analysis and monitoring
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Demo Widget */}
        <div className="bg-background border border-foreground/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-foreground/5">
          {/* Form */}
          <div className="space-y-6 lg:space-y-8 mb-6 lg:mb-10">
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
                This helps tailor the response to your perspective
              </p>
            </div>

            {/* Query Input */}
            <div className="space-y-2 lg:space-y-3">
              <label htmlFor="query-input" className="block text-sm font-semibold text-foreground">
                Your Question
              </label>
              <textarea
                id="query-input"
                value={state.query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Describe your project, position, case, or area of interest..."
                rows={4}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-background border border-foreground/20 rounded-xl text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 hover:border-foreground/30 resize-none"
                aria-describedby="query-help query-counter"
              />
              <div className="flex items-center justify-between">
                <p id="query-help" className="text-sm text-muted leading-relaxed">
                  Ask me anything about my experience and expertise
                </p>
                <span
                  id="query-counter"
                  className={`text-sm transition-colors duration-200 ${state.query.length > 999
                    ? 'text-red-400'
                    : state.query.length > 800
                      ? 'text-yellow-400'
                      : 'text-muted'
                    }`}
                >
                  {state.query.length}/1000
                </span>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Quick Prompts
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left px-3 py-2 text-sm text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all duration-200 border border-transparent hover:border-accent/20"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
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
                  Thinking...
                </>
              ) : (
                'Ask Marko AI'
              )}
            </button>
            <p id="generate-help" className="mt-2 text-sm text-muted">
              Powered by AWS Bedrock & Lambda
            </p>
          </div>



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

      {/* Response Modal */}
      {showModal && state.result && (
        <div
          className="fixed inset-0 bg-accent/5 animate-fade-in flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-background border border-foreground/10 rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Marko&apos;s Response</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-lg hover:bg-accent/10"
                  aria-label="Copy response to clipboard"
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
                <button
                  onClick={closeModal}
                  className="inline-flex items-center justify-center w-8 h-8 text-muted hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-lg hover:bg-foreground/10"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className="text-foreground leading-relaxed text-lg mb-6 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(state.result.pitch) }}
            />

            <div className="flex items-center justify-between text-sm text-muted pt-4 border-t border-accent/10">
              <span>Confidence: {Math.round(state.result.confidence * 100)}%</span>
              <span>Generated: {new Date(state.result.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}