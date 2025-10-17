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