/** @type {import('next').NextConfig} */

// Load environment variables with fallbacks for local development
const stage = process.env.NEXT_PUBLIC_STAGE || process.env.STAGE || 'dev';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:3000/api`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`;

console.log(`🔧 Next.js Config - Stage: ${stage}, API: ${apiUrl}`);

const nextConfig = {
  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Environment variables with fallbacks
  env: {
    // Ensure these are available at build time with fallbacks
    NEXT_PUBLIC_STAGE: stage,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    // Lambda function URLs (server-side only)
    PITCH_LAMBDA_URL: process.env.PITCH_LAMBDA_URL,
    LEAD_LAMBDA_URL: process.env.LEAD_LAMBDA_URL,
    HEALTH_LAMBDA_URL: process.env.HEALTH_LAMBDA_URL,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  },

  // Public runtime config for client-side access
  publicRuntimeConfig: {
    stage,
    apiUrl,
    siteUrl,
  },

  // Server runtime config for server-side access
  serverRuntimeConfig: {
    stage,
    apiUrl,
    siteUrl,
    // Backend configuration
    tableName: process.env.TABLE_NAME || `personalSiteData-${stage}`,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || (stage === 'prod' ? '30' : '10')),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60'),
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    corsOrigin: process.env.CORS_ORIGIN || siteUrl,
    // Lambda function URLs
    pitchLambdaUrl: process.env.PITCH_LAMBDA_URL,
    leadLambdaUrl: process.env.LEAD_LAMBDA_URL,
    healthLambdaUrl: process.env.HEALTH_LAMBDA_URL,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Static asset caching
      {
        source: '/(.*)\\.(js|css|woff|woff2|eot|ttf|otf|svg|png|jpg|jpeg|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Redirects for clean URLs
  async redirects() {
    return [
      // Redirect www to non-www (only in production)
      ...(stage === 'prod' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'www.marko.dev',
            },
          ],
          destination: 'https://marko.dev/:path*',
          permanent: true,
        },
      ] : []),
    ];
  },

  // Webpack configuration for performance optimization
  webpack: (config, { buildId, webpack }) => {
    // Add build-time environment injection
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      })
    );

    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analyzer-report.html',
        })
      );
    }

    // Optimize chunks for better caching
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },

  // Output configuration for Amplify
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Trailing slash handling
  trailingSlash: false,

  // Experimental features for performance
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable optimized fonts
    optimizePackageImports: ['clsx', 'tailwind-merge'],
    // Enable partial prerendering for better performance
    ppr: false, // Keep disabled for now as it's still experimental
  },
};

module.exports = nextConfig;