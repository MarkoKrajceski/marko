'use client';

import { OffersSectionProps, OfferTier, offers, FEATURE_CATALOG } from '@/types';
import OfferCard from './OfferCard';
import { useEffect, useState } from 'react';

export default function OffersSection({ className = '', onGetStartedClick }: OffersSectionProps) {
  // State for managing popup modal
  const [selectedTier, setSelectedTier] = useState<OfferTier | null>(null);

  // Handle card click to open popup
  const handleCardClick = (tier: OfferTier) => {
    setSelectedTier(tier);
  };

  // Handle closing popup
  const handleClosePopup = () => {
    setSelectedTier(null);
  };

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTier) {
        handleClosePopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedTier]);

  // Announce section to screen readers when it comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Announce to screen readers that the offers section is now visible
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = 'Template packages section is now visible. Three pricing tiers are available: Starter, Standard, and Advanced.';
            document.body.appendChild(announcement);

            // Clean up the announcement after a short delay
            setTimeout(() => {
              document.body.removeChild(announcement);
            }, 1000);

            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('offers-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  // Feature resolution logic for inherited features
  const resolveInheritedFeatures = (tier: OfferTier, allTiers: OfferTier[]): string[] => {
    const resolvedFeatures: string[] = [];

    // If this tier inherits from another, get the parent's features first
    if (tier.inheritsFrom) {
      const parentTier = allTiers.find(t => t.id === tier.inheritsFrom);
      if (parentTier) {
        // Recursively resolve parent features
        resolvedFeatures.push(...resolveInheritedFeatures(parentTier, allTiers));
      }
    }

    // Add this tier's own features
    resolvedFeatures.push(...tier.features);

    return resolvedFeatures;
  };

  // Create enhanced tiers with resolved features
  const enhancedTiers = offers.map(tier => ({
    ...tier,
    resolvedFeatures: resolveInheritedFeatures(tier, offers)
  }));

  return (
    <>
      {/* Skip link for keyboard navigation */}
      <a
        href="#offers-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-background focus:rounded-md focus:font-semibold focus:shadow-lg"
      >
        Skip to offers section
      </a>

      <section
        id="offers-section"
        className={`h-screen flex items-center justify-center py-8 lg:py-12 ${className}`}
        aria-labelledby="offers-heading"
        aria-describedby="offers-description"
        role="region"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-full flex flex-col justify-center">
          {/* Section Header */}
          <div className="text-center mb-8 lg:mb-12 animate-fade-in-up">
            <h2
              id="offers-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Choose Your Perfect
              <span className="block text-accent mt-2" aria-label="Solution Package">Solution Package</span>
            </h2>
            <p
              id="offers-description"
              className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
            >
              From simple landing pages to enterprise-ready applications with AI integration.
              Built with modern technologies and best practices, ready to deploy and scale.
            </p>
          </div>

          {/* Offers Container - Mobile: Stack, Desktop: Flex Row */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 items-start content-start">
            {enhancedTiers.map((tier, index) => (
              <div
                key={tier.id}
                className="animate-fade-in-up lg:flex-1"
                style={{
                  animationDelay: `${0.2 + (index * 0.2)}s`
                }}
                role="listitem"
              >
                <OfferCard
                  tier={{
                    ...tier,
                    // Override features with resolved features for display
                    features: tier.resolvedFeatures.map(featureKey =>
                      FEATURE_CATALOG[featureKey as keyof typeof FEATURE_CATALOG] || featureKey
                    )
                  }}
                  onGetStartedClick={onGetStartedClick}
                  onCardClick={() => handleCardClick(tier)}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Popup Modal */}
          {selectedTier && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleClosePopup}
            >
              <div 
                className="relative bg-background border border-foreground/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors z-10"
                  aria-label="Close popup"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Popup Content */}
                <div className="p-6 lg:p-8">
                  {/* Header */}
                  <div className="text-center mb-6">
                    {selectedTier.badge && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-background bg-accent rounded-full mb-4">
                        {selectedTier.badge}
                      </span>
                    )}
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {selectedTier.name}
                    </h3>
                    <p className="text-muted mb-4">
                      {selectedTier.description}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl lg:text-4xl font-bold text-foreground">
                          {selectedTier.currency === 'EUR' ? '€' : selectedTier.currency === 'USD' ? '$' : 'MKD'}{selectedTier.price.toLocaleString()}
                        </span>
                        {selectedTier.priceType === 'starting_at' && (
                          <span className="text-sm text-muted">starting at</span>
                        )}
                      </div>
                      <div className="text-sm text-muted capitalize">
                        {selectedTier.cadence.replace('_', ' ')} project
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      What's Included
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTier.resolvedFeatures.map((featureKey, featureIndex) => {
                        const feature = FEATURE_CATALOG[featureKey as keyof typeof FEATURE_CATALOG] || featureKey;
                        return (
                          <div key={featureIndex} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                              <svg
                                className="w-3 h-3 text-accent"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline and Support */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTier.timelineWeeks && (
                      <div className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg">
                        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-foreground">Timeline</div>
                          <div className="text-sm text-muted">{selectedTier.timelineWeeks} week{selectedTier.timelineWeeks > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    )}

                    {selectedTier.supportSLA && (
                      <div className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg">
                        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                        </svg>
                        <div>
                          <div className="font-medium text-foreground">Support</div>
                          <div className="text-sm text-muted">{selectedTier.supportSLA}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedTier.notes && selectedTier.notes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Additional Notes</h4>
                      {selectedTier.notes.map((note, noteIndex) => (
                        <p key={noteIndex} className="text-sm text-muted/80 italic mb-1">
                          * {note}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedTier.demoUrl && (
                      <button
                        onClick={() => window.open(selectedTier.demoUrl, '_blank', 'noopener,noreferrer')}
                        className="flex-1 px-6 py-3 text-sm font-medium border border-accent/30 text-accent rounded-lg transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        View Live Demo
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onGetStartedClick();
                        handleClosePopup();
                      }}
                      className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:scale-105 ${
                        selectedTier.highlighted
                          ? 'bg-accent text-background hover:bg-accent/90 hover:shadow-accent/25 focus:ring-accent focus:bg-accent/90'
                          : 'border-2 border-foreground/20 text-foreground hover:border-accent hover:text-accent hover:shadow-foreground/10 focus:ring-accent focus:border-accent focus:text-accent'
                      }`}
                    >
                      {selectedTier.cta?.label || 'Get Started'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div
            className="mt-6 lg:mt-8 text-center animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
            role="complementary"
            aria-labelledby="additional-info-heading"
          >
            <div className="bg-background/50 backdrop-blur-sm border border-foreground/10 rounded-lg p-4 lg:p-6 max-w-4xl mx-auto">
              <p className="text-sm text-muted/80">
                Need something custom?
                <button
                  onClick={onGetStartedClick}
                  className="text-accent hover:text-accent/80 focus:text-accent/80 transition-colors duration-200 ml-1 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                  aria-label="Contact us to discuss your custom requirements"
                  type="button"
                >
                  Let&apos;s discuss your specific requirements
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}