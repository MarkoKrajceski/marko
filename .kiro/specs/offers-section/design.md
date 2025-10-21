# Design Document

## Overview

The offers section will be a new component that displays three pricing tiers (Starter, Standard, Advanced) in a visually appealing card layout. It will be positioned between the "What I Do" section and the "Marko AI" demo section, maintaining the existing full-screen slide navigation pattern.

## Architecture

### Component Structure
```
OffersSection/
├── OffersSection.tsx (main component)
├── OfferCard.tsx (individual pricing card)
└── types (integrated into existing types/index.ts)
```

### Integration Points
- **Hero Component**: Add "View Offers" button to existing CTA buttons
- **Main Page**: Insert offers section between WhatIDo and LiveDemo sections
- **Navigation**: Update scroll navigation to include offers section
- **Contact Form**: Ensure "Get Started" buttons scroll to contact section

## Components and Interfaces

### OffersSection Component
```typescript
interface OfferTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'MKD';
  cadence: 'one_time' | 'monthly' | 'annual';
  priceType?: 'fixed' | 'starting_at' | 'range';
  features: string[];
  inheritsFrom?: string;
  highlighted?: boolean;
  badge?: string;
  deliverables?: string[];
  timelineWeeks?: number;
  supportSLA?: string;
  cta?: { label: string; href: string };
  notes?: string[];
}

interface OffersSectionProps {
  className?: string;
  onGetStartedClick: () => void;
}
```

### OfferCard Component
```typescript
interface OfferCardProps {
  tier: OfferTier;
  onGetStartedClick: () => void;
  index: number; // for staggered animations
}
```

### Template Feature Mapping
Based on analysis of the template packages and your Upwork offerings:

**Starter Tier (€250 starting at)**
- Next.js 15 with App Router
- Tailwind CSS styling
- Fully responsive design
- On-page SEO (meta, OG, sitemap)
- Contact form + validation + spam filter
- Security headers (CSP, HSTS)
- Uptime & health checks (status page)
- Deliverables: 1 landing page + 1 inner page, sitemap & OG tags, status page
- Timeline: 1 week, Email support (48h SLA)

**Standard Tier (€700 starting at) - Most Popular**
- Everything in Starter
- Authentication (email/password; OAuth optional)
- MDX content management
- Blog (categories, tags, RSS)
- Analytics (Plausible/GA4)
- ISR/Edge routing
- Dashboard UI components
- Sanity CMS integration
- Deliverables: Blog setup, MDX content pipeline, Auth system
- Timeline: 2 weeks, Email support (24h SLA)

**Advanced Tier (€1400 starting at)**
- Everything in Standard
- AI integration (Bedrock/OpenAI)*
- Structured logging & error tracking
- Admin dashboard
- Hardened security & audit
- Rate limiting & middleware
- Feature flags system
- Database integration (Postgres/DynamoDB)
- Deliverables: Admin portal, feature flags setup, observability dashboard
- Timeline: 3 weeks, Chat support (8h SLA)
- *AI usage billed at cost with monthly cap

## Data Models

### Offer Configuration
```typescript
type Cadence = 'one_time' | 'monthly' | 'annual';
type PriceType = 'fixed' | 'starting_at' | 'range';

interface OfferTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'MKD';
  cadence: Cadence;
  priceType?: PriceType;
  features: string[];
  inheritsFrom?: string;
  highlighted?: boolean;
  badge?: string;
  deliverables?: string[];
  timelineWeeks?: number;
  supportSLA?: string;
  cta?: { label: string; href: string };
  notes?: string[];
}

const FEATURE_CATALOG = {
  'nextjs15': 'Next.js 15 (App Router)',
  'tailwind': 'Tailwind CSS styling',
  'responsive': 'Fully responsive design',
  'seo': 'On-page SEO (meta, OG, sitemap)',
  'contact-form': 'Contact form + validation + spam filter',
  'security-headers': 'Security headers (CSP, HSTS)',
  'uptime': 'Uptime & health checks (status page)',
  'auth-basic': 'Authentication (email/password; OAuth optional)',
  'mdx': 'MDX content management',
  'blog': 'Blog (categories, tags, RSS)',
  'analytics': 'Analytics (Plausible/GA4)',
  'routing-advanced': 'ISR/Edge routing',
  'dashboard-ui': 'Dashboard UI components',
  'sanity': 'Sanity CMS integration',
  'ai': 'AI integration (Bedrock/OpenAI)',
  'logging': 'Structured logging & error tracking',
  'admin': 'Admin dashboard',
  'security-enterprise': 'Hardened security & audit',
  'rate-limit': 'Rate limiting & middleware',
  'feature-flags': 'Feature flags system',
  'database': 'Database integration (Postgres/DynamoDB)'
} as const;

const offers: OfferTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 250,
    currency: 'EUR',
    cadence: 'one_time',
    priceType: 'starting_at',
    description: 'Perfect for small businesses and startups',
    features: [
      'nextjs15', 'tailwind', 'responsive', 'seo',
      'contact-form', 'security-headers', 'uptime'
    ],
    deliverables: ['1 landing page + 1 inner page', 'Sitemap & OG tags', 'Status page'],
    timelineWeeks: 1,
    supportSLA: 'Email support (48h SLA)',
    cta: { label: 'Get Started', href: '#contact' }
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 700,
    currency: 'EUR',
    cadence: 'one_time',
    priceType: 'starting_at',
    description: 'Ideal for growing businesses with content needs',
    inheritsFrom: 'starter',
    features: [
      'auth-basic', 'mdx', 'blog', 'analytics',
      'routing-advanced', 'dashboard-ui', 'sanity'
    ],
    deliverables: ['Blog setup', 'MDX content pipeline', 'Auth system'],
    timelineWeeks: 2,
    supportSLA: 'Email support (24h SLA)',
    highlighted: true,
    badge: 'Most Popular',
    cta: { label: 'Get Started', href: '#contact' }
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 1400,
    currency: 'EUR',
    cadence: 'one_time',
    priceType: 'starting_at',
    description: 'Enterprise-ready with AI and advanced features',
    inheritsFrom: 'standard',
    features: [
      'ai', 'logging', 'admin', 'security-enterprise',
      'rate-limit', 'feature-flags', 'database'
    ],
    notes: ['AI usage billed at cost with monthly cap'],
    deliverables: ['Admin portal', 'Feature flags setup', 'Observability dashboard'],
    timelineWeeks: 3,
    supportSLA: 'Chat support (8h SLA)',
    cta: { label: 'Get Started', href: '#contact' }
  }
];
```

## Visual Design

### Layout Structure
- **Full-screen section** following existing pattern
- **Three-column grid** on desktop (responsive to single column on mobile)
- **Card-based design** with hover effects matching existing components
- **Centered content** with max-width container

### Styling Approach
- **Consistent with existing design system**
- **Color scheme**: Background cards with accent highlights
- **Typography**: Matching existing font hierarchy
- **Spacing**: Following existing 8px grid system
- **Animations**: Staggered fade-in-up animations with delays

### Card Design Elements
```css
.offer-card {
  /* Base styling matching existing components */
  background: var(--background);
  border: 1px solid var(--foreground)/10;
  border-radius: 1rem;
  padding: 2rem;
  
  /* Hover effects */
  transition: all 0.3s ease;
  hover:border-accent/30;
  hover:shadow-lg;
  hover:shadow-accent/10;
  hover:transform: translateY(-8px);
}

.offer-card.highlighted {
  border-color: var(--accent)/30;
  background: linear-gradient(to-br, var(--accent)/5, var(--secondary)/5);
}
```

### Responsive Behavior
- **Desktop (lg+)**: Three columns, full hover effects
- **Tablet (md)**: Two columns with third card below
- **Mobile (sm)**: Single column stack
- **Animations**: Reduced motion support

## Error Handling

### Graceful Degradation
- **Component fails to load**: Show fallback message with contact information
- **Animation issues**: Fallback to static layout
- **Responsive breakpoints**: Ensure readability at all screen sizes

### Accessibility Considerations
- **Semantic HTML**: Proper heading hierarchy and list structures
- **ARIA labels**: Clear descriptions for screen readers
- **Keyboard navigation**: Focus management for interactive elements
- **Color contrast**: Ensure WCAG AA compliance
- **Reduced motion**: Respect user preferences

## Testing Strategy

### Component Testing
- **Render testing**: Verify all tiers display correctly
- **Interaction testing**: Ensure "Get Started" buttons work
- **Responsive testing**: Check layout at different breakpoints
- **Animation testing**: Verify staggered animations work properly

### Integration Testing
- **Hero button integration**: Test "View Offers" button scrolling
- **Navigation flow**: Verify smooth scrolling between sections
- **Contact form integration**: Ensure "Get Started" leads to contact

### Visual Regression Testing
- **Screenshot comparison**: Ensure consistent visual appearance
- **Cross-browser testing**: Verify compatibility across browsers
- **Device testing**: Test on various screen sizes and devices

## Performance Considerations

### Optimization Strategies
- **Lazy loading**: Component loads when approaching viewport
- **Animation performance**: Use transform and opacity for smooth animations
- **Bundle size**: Minimal additional JavaScript footprint
- **Image optimization**: Use optimized icons and graphics

### Metrics to Monitor
- **First Contentful Paint**: Impact on page load times
- **Cumulative Layout Shift**: Ensure stable layout during load
- **Interaction to Next Paint**: Smooth button interactions

## Implementation Notes

### Animation Timing
- **Staggered entrance**: 200ms delay between cards
- **Hover effects**: 300ms transition duration
- **Scroll animations**: Trigger when 20% of section is visible

### Accessibility Features
- **Focus indicators**: Clear focus rings on interactive elements
- **Screen reader support**: Proper ARIA labels and descriptions
- **Keyboard navigation**: Tab order follows visual layout

### Browser Support
- **Modern browsers**: Full feature support
- **Legacy browsers**: Graceful degradation without animations
- **Mobile browsers**: Touch-optimized interactions