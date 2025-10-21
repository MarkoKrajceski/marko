'use client';

import { OfferCardProps, FEATURE_CATALOG } from '@/types';

export default function OfferCard({
  tier,
  onGetStartedClick,
  onCardClick,
  index
}: OfferCardProps) {

  // Format price display
  const formatPrice = () => {
    const currencySymbol = tier.currency === 'EUR' ? '€' : tier.currency === 'USD' ? '$' : 'MKD';
    const priceText = tier.priceType === 'starting_at' ? 'starting at' : '';

    return (
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-foreground">
            {currencySymbol}{tier.price.toLocaleString()}
          </span>
          {priceText && (
            <span className="text-xs text-muted">{priceText}</span>
          )}
        </div>
        <div className="text-xs text-muted capitalize">
          {tier.cadence.replace('_', ' ')} project
        </div>
      </div>
    );
  };

  // Features are now passed as resolved strings from OffersSection
  const features = Array.isArray(tier.features) && typeof tier.features[0] === 'string'
    ? tier.features
    : tier.features.map(featureKey =>
      FEATURE_CATALOG[featureKey as keyof typeof FEATURE_CATALOG] || featureKey
    );

  // Show only first 4 features in card preview
  const displayFeatures = features.slice(0, 4);
  const hasMoreFeatures = features.length > 4;

  const handleViewDemo = () => {
    if (tier.demoUrl) {
      window.open(tier.demoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      className={`group relative bg-background border animate-fade-in-up h-full transition-all duration-300 cursor-pointer rounded-xl p-4 lg:p-5 border-foreground/10 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 flex flex-col ${tier.highlighted
        ? 'border-accent/30 bg-gradient-to-br from-accent/5 to-secondary/5'
        : ''
        }`}
      style={{
        animationDelay: `${index * 0.2}s`
      }}
      onClick={onCardClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick();
        }
      }}
    >
      {/* Badge for highlighted tier */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-background bg-accent rounded-full">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Card Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl transition-opacity duration-700 opacity-0 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="text-center mb-4">
          <h3 className="text-lg lg:text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
            {tier.name}
          </h3>
          <p className="text-sm text-muted mb-3">
            {tier.description}
          </p>
          {formatPrice()}
        </header>

        {/* Features List */}
        <div className="mb-4 flex-1">
          <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
            What's Included
          </h4>

          {/* Features List */}
          <div className="space-y-2">
            {displayFeatures.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-accent"
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
                <span className="text-xs text-muted group-hover:text-foreground/90 transition-colors duration-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {hasMoreFeatures && (
            <div className="text-xs text-accent/60 mt-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              +{features.length - 4} more features (click to view all)
            </div>
          )}
        </div>

        {/* Timeline and Support - Compact */}
        <div className="mb-4 space-y-2 text-xs text-muted">
          {tier.timelineWeeks && (
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{tier.timelineWeeks} week{tier.timelineWeeks > 1 ? 's' : ''}</span>
            </div>
          )}

          {tier.supportSLA && (
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
              </svg>
              <span>{tier.supportSLA}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {tier.notes && tier.notes.length > 0 && (
          <div className="mb-4">
            {tier.notes.slice(0, 1).map((note, noteIndex) => (
              <p key={noteIndex} className="text-xs text-muted/80 italic">
                * {note}
              </p>
            ))}
            {tier.notes.length > 1 && (
              <p className="text-xs text-accent/60 mt-1">
                +{tier.notes.length - 1} more note{tier.notes.length > 2 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          {/* Demo Button */}
          {tier.demoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDemo();
              }}
              className="w-full px-4 py-2 text-sm font-medium border border-accent/30 text-accent rounded-lg transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              View Live Demo
            </button>
          )}

          {/* Main CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGetStartedClick();
            }}
            className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:scale-105 ${tier.highlighted
              ? 'bg-accent text-background hover:bg-accent/90 hover:shadow-accent/25 focus:ring-accent focus:bg-accent/90'
              : 'border-2 border-foreground/20 text-foreground hover:border-accent hover:text-accent hover:shadow-foreground/10 focus:ring-accent focus:border-accent focus:text-accent'
              }`}
          >
            {tier.cta?.label || 'Get Started'}
          </button>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-accent/20 transition-colors duration-300" />
    </article>
  );
}