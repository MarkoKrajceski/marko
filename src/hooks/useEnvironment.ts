/**
 * React Hook for Type-Safe Environment Variable Access
 * 
 * This hook provides type-safe access to environment variables in React components
 * with proper error handling and development warnings.
 */

import { useEffect, useState } from 'react';
import { getStage, getApiUrl, getSiteUrl, isDevelopment } from '@/lib/env';

interface EnvironmentConfig {
  stage: 'dev' | 'staging' | 'prod';
  apiUrl: string;
  siteUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

interface EnvironmentHookResult {
  env: EnvironmentConfig | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to access validated environment variables in React components
 * 
 * @returns {EnvironmentHookResult} Environment configuration with loading and error states
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { env, isLoading, error } = useEnvironment();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       <p>Stage: {env.stage}</p>
 *       <p>API URL: {env.apiUrl}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnvironment(): EnvironmentHookResult {
  const [env, setEnv] = useState<EnvironmentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const config: EnvironmentConfig = {
        stage: getStage(),
        apiUrl: getApiUrl(),
        siteUrl: getSiteUrl(),
        isDevelopment,
        isProduction: !isDevelopment,
      };

      setEnv(config);
      setError(null);

      // Log environment config in development
      if (isDevelopment) {
        console.log('🔧 Environment loaded:', config);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown environment error';
      setError(errorMessage);
      console.error('❌ Environment validation failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { env, isLoading, error };
}

/**
 * Hook to get the current stage with a fallback
 * 
 * @param fallback - Fallback stage if environment validation fails
 * @returns Current stage or fallback
 */
export function useStage(fallback: 'dev' | 'staging' | 'prod' = 'dev'): 'dev' | 'staging' | 'prod' {
  const { env } = useEnvironment();
  return env?.stage || fallback;
}

/**
 * Hook to get the API URL with a fallback
 * 
 * @param fallback - Fallback API URL if environment validation fails
 * @returns API URL or fallback
 */
export function useApiUrl(fallback: string = '/api'): string {
  const { env } = useEnvironment();
  return env?.apiUrl || fallback;
}

/**
 * Hook to get the site URL with a fallback
 * 
 * @param fallback - Fallback site URL if environment validation fails
 * @returns Site URL or fallback
 */
export function useSiteUrl(fallback: string = 'http://localhost:3000'): string {
  const { env } = useEnvironment();
  return env?.siteUrl || fallback;
}

/**
 * Hook to check if we're in development mode
 * 
 * @returns True if in development mode
 */
export function useIsDevelopment(): boolean {
  const { env } = useEnvironment();
  return env?.isDevelopment ?? false;
}

/**
 * Hook to check if we're in production mode
 * 
 * @returns True if in production mode
 */
export function useIsProduction(): boolean {
  const { env } = useEnvironment();
  return env?.isProduction ?? false;
}

/**
 * Hook for conditional rendering based on environment stage
 * 
 * @param stages - Array of stages where content should be shown
 * @returns True if current stage is in the provided array
 * 
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const showDebug = useStageConditional(['dev', 'staging']);
 *   
 *   if (!showDebug) return null;
 *   
 *   return <div>Debug information...</div>;
 * }
 * ```
 */
export function useStageConditional(stages: Array<'dev' | 'staging' | 'prod'>): boolean {
  const currentStage = useStage();
  return stages.includes(currentStage);
}

/**
 * Hook to get environment-specific configuration values
 * 
 * @param config - Configuration object with stage-specific values
 * @returns Value for current stage or default
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const timeout = useStageConfig({
 *     dev: 1000,
 *     staging: 5000,
 *     prod: 10000,
 *   }, 5000);
 *   
 *   // timeout will be 1000 in dev, 5000 in staging, 10000 in prod
 * }
 * ```
 */
export function useStageConfig<T>(
  config: Partial<Record<'dev' | 'staging' | 'prod', T>>,
  defaultValue: T
): T {
  const currentStage = useStage();
  return config[currentStage] ?? defaultValue;
}