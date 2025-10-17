'use client';

import { useState } from 'react';
import { ContactProps, ContactState, ContactForm, LeadRequest, LeadResponse } from '@/types';
import { LoadingIcon, CheckIcon } from './Icons';

export default function Contact({ className = '' }: ContactProps) {
  const [state, setState] = useState<ContactState>({
    form: {
      name: '',
      email: '',
      message: '',
    },
    loading: false,
    success: false,
    error: null,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (name: keyof ContactForm, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';

      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 1000) return 'Message must be less than 1000 characters';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (name: keyof ContactForm, value: string) => {
    setState(prev => ({
      ...prev,
      form: { ...prev.form, [name]: value },
      error: null,
    }));

    // Real-time validation
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(state.form).forEach(key => {
      const fieldName = key as keyof ContactForm;
      const error = validateField(fieldName, state.form[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: LeadRequest = {
        name: state.form.name.trim(),
        email: state.form.email.trim(),
        message: state.form.message.trim(),
      };

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const result: LeadResponse = await response.json();

      if (result.ok) {
        setState(prev => ({
          ...prev,
          loading: false,
          success: true,
          form: { name: '', email: '', message: '' },
        }));
        setFieldErrors({});
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Something went wrong',
        loading: false,
      }));
    }
  };

  const resetForm = () => {
    setState({
      form: { name: '', email: '', message: '' },
      loading: false,
      success: false,
      error: null,
    });
    setFieldErrors({});
  };

  if (state.success) {
    return (
      <section className={`min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0 ${className}`}>
        <div className="max-w-2xl mx-auto text-center w-full">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <CheckIcon className="w-8 h-8 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">
              Message Sent Successfully!
            </h2>

            <p className="text-muted mb-6">
              Thanks for reaching out! I&apos;ll get back to you within 24 hours.
            </p>

            <button
              onClick={resetForm}
              className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`min-h-screen lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-0 ${className}`}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-base lg:text-lg text-muted">
            Ready to automate the boring and scale the bold? Let&apos;s talk about your next project.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-background border border-foreground/10 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
          <form onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <div className="mb-4 lg:mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={state.form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors duration-200 ${fieldErrors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-foreground/20 focus:border-accent'
                  }`}
                placeholder="Your full name"
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-4 lg:mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={state.form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors duration-200 ${fieldErrors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-foreground/20 focus:border-accent'
                  }`}
                placeholder="your.email@example.com"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="mb-4 lg:mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                value={state.form.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors duration-200 resize-vertical ${fieldErrors.message
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-foreground/20 focus:border-accent'
                  }`}
                placeholder="Tell me about your project, timeline, and how I can help..."
                aria-describedby={fieldErrors.message ? 'message-error' : 'message-help'}
                aria-invalid={!!fieldErrors.message}
              />
              {fieldErrors.message ? (
                <p id="message-error" className="mt-1 text-sm text-red-400" role="alert">
                  {fieldErrors.message}
                </p>
              ) : (
                <p id="message-help" className="mt-1 text-sm text-muted">
                  {state.form.message.length}/1000 characters
                </p>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-foreground/5 border border-foreground/10 rounded-lg">
              <p className="text-xs lg:text-sm text-muted">
                <strong>Privacy Notice:</strong> Your info is used only to get back to you.
                I don&apos;t share, sell, or spam. Data is stored securely and deleted after 30 days.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state.loading}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-background font-semibold rounded-lg transition-all duration-300 hover:bg-accent/90 hover:scale-105 hover:shadow-lg hover:shadow-accent/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {state.loading ? (
                <>
                  <LoadingIcon className="w-4 h-4" />
                  Sending Message...
                </>
              ) : (
                'Send Message'
              )}
            </button>

            {/* Error Display */}
            {state.error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                <p className="text-red-400 text-sm">
                  <strong>Error:</strong> {state.error}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}