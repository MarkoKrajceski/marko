// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface PitchRequest {
  role: 'recruiter' | 'cto' | 'product' | 'founder' | 'other';
  query: string;
}

export interface PitchResponse {
  pitch: string;
  confidence: number;
  timestamp: string;
  requestId: string;
}

export interface LeadRequest {
  name: string;
  email: string;
  message: string;
}

export interface LeadResponse {
  ok: boolean;
  message?: string;
}

export interface HealthResponse {
  ok: boolean;
  env: string;
  version: string;
  timestamp: string;
  uptime: number;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface ErrorResponse {
  error: true;
  message: string;
  code: string;
  timestamp: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
}

// =============================================================================
// COMPONENT PROP INTERFACES
// =============================================================================

export interface HeroProps {
  onDemoClick: () => void;
  onContactClick: () => void;
  onOffersClick: () => void;
}

export interface ServiceCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface WhatIDoProps {
  services: ServiceCard[];
}

export interface DemoState {
  role: 'recruiter' | 'cto' | 'product' | 'founder' | 'other' | '';
  query: string;
  loading: boolean;
  result: PitchResponse | null;
  error: string | null;
}

export interface LiveDemoProps {
  className?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactState {
  form: ContactForm;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface ContactProps {
  className?: string;
}

// =============================================================================
// OFFERS SECTION TYPES
// =============================================================================

export type Cadence = 'one_time' | 'monthly' | 'annual';
export type PriceType = 'fixed' | 'starting_at' | 'range';
export type Currency = 'EUR' | 'USD' | 'MKD';

export interface OfferTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
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
  demoUrl?: string;
}

export interface OffersSectionProps {
  className?: string;
  onGetStartedClick: () => void;
}

export interface OfferCardProps {
  tier: OfferTier;
  onGetStartedClick: () => void;
  onCardClick: () => void;
  index: number; // for staggered animations
}

// =============================================================================
// DYNAMODB ITEM TYPE DEFINITIONS
// =============================================================================

export interface BaseDynamoDBItem {
  pk: string;
  sk: string;
  timestamp: string;
  ttl: number;
}

export interface PitchAnalyticsItem extends BaseDynamoDBItem {
  pk: `pitch#${string}`; // pitch#${requestId}
  sk: `time#${string}`;  // time#${isoTimestamp}
  role: 'recruiter' | 'cto' | 'product' | 'founder' | 'other';
  query: string;
  ipHash: string;
  userAgentHash: string;
  confidence: number;
}

export interface LeadCaptureItem extends BaseDynamoDBItem {
  pk: `lead#${string}`;   // lead#${email}
  sk: `time#${string}`;   // time#${isoTimestamp}
  name: string;
  email: string;
  message: string;
  source: 'contact-form';
}

export interface AnalyticsCounterItem extends BaseDynamoDBItem {
  pk: `counter#${string}`; // counter#page-views
  sk: `daily#${string}`;   // daily#${date}
  count: number;
  lastUpdated: string;
}

// Union type for all DynamoDB items
export type DynamoDBItem = PitchAnalyticsItem | LeadCaptureItem | AnalyticsCounterItem;

// =============================================================================
// UTILITY TYPES AND ENUMS
// =============================================================================

export enum UserRole {
  RECRUITER = 'recruiter',
  CTO = 'cto',
  PRODUCT = 'product',
  FOUNDER = 'founder',
  OTHER = 'other'
}



export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT'
}

// =============================================================================
// LAMBDA HANDLER TYPES
// =============================================================================

export interface LambdaContext {
  requestId: string;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis(): number;
}

export interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters: Record<string, string> | null;
  queryStringParameters: Record<string, string> | null;
  headers: Record<string, string>;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: {
    requestId: string;
    identity: {
      sourceIp: string;
      userAgent: string;
    };
  };
}

export interface APIGatewayResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ContactFormValidation extends FormValidation {
  errors: {
    name?: string;
    email?: string;
    message?: string;
  };
}

export interface PitchFormValidation extends FormValidation {
  errors: {
    role?: string;
    query?: string;
  };
}

// =============================================================================
// ANALYTICS AND METRICS TYPES
// =============================================================================

export interface RequestMetrics {
  requestId: string;
  timestamp: string;
  duration: number;
  statusCode: number;
  endpoint: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PitchMetrics extends RequestMetrics {
  role: UserRole;
  query: string;
  confidence: number;
}

// =============================================================================
// ENVIRONMENT AND CONFIGURATION TYPES
// =============================================================================

export interface EnvironmentConfig {
  STAGE: string;
  TABLE_NAME: string;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW: number;
  CORS_ORIGIN?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (event: APIGatewayEvent) => string;
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};



export const isErrorResponse = (response: unknown): response is ErrorResponse => {
  return !!(response && typeof response === 'object' && response !== null && 'error' in response && (response as ErrorResponse).error === true);
};

export const isPitchAnalyticsItem = (item: DynamoDBItem): item is PitchAnalyticsItem => {
  return item.pk.startsWith('pitch#');
};

export const isLeadCaptureItem = (item: DynamoDBItem): item is LeadCaptureItem => {
  return item.pk.startsWith('lead#');
};

// =============================================================================
// API CLIENT UTILITIES
// =============================================================================

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.timeout = config.timeout || 10000;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
}

// =============================================================================
// OFFERS DATA AND CONSTANTS
// =============================================================================

export const FEATURE_CATALOG = {
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

export const offers: OfferTier[] = [
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
    cta: { label: 'Get Started', href: '#contact' },
    demoUrl: 'https://starter.marko.business'
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
    cta: { label: 'Get Started', href: '#contact' },
    demoUrl: 'https://standard.marko.business'
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
    deliverables: ['Admin portal', 'Feature flags setup', 'Observability dashboard'],
    timelineWeeks: 3,
    supportSLA: 'Chat support (8h SLA)',
    cta: { label: 'Get Started', href: '#contact' },
    demoUrl: 'https://advanced.marko.business'
  }
];