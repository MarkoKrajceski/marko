/**
 * Version Configuration
 * 
 * This file contains version-related configuration and metadata
 * for the Marko Personal Introduction Site project.
 */

module.exports = {
  // Project metadata
  project: {
    name: 'Marko Personal Introduction Site',
    codename: 'marko-site',
    description: 'Production-ready personal introduction website with AWS Amplify and Next.js 15',
    repository: 'https://github.com/marko/personal-site',
    homepage: 'https://marko.dev',
    author: 'Marko',
    license: 'Private'
  },

  // Version configuration
  version: {
    // Current version (should match package.json)
    current: '1.0.0',
    
    // Version format for builds
    buildFormat: '{version}-{shortHash}',
    
    // Version format for releases
    releaseFormat: 'v{version}',
    
    // Pre-release identifiers
    preRelease: {
      alpha: 'alpha',
      beta: 'beta',
      rc: 'rc'
    }
  },

  // Release configuration
  releases: {
    // Release history
    history: [
      {
        version: '1.0.0',
        date: '2024-01-15',
        type: 'major',
        description: 'Initial production release',
        features: [
          'Single-page application with live Lambda demo',
          'Contact form with DynamoDB integration',
          'AWS Amplify deployment with CI/CD',
          'CloudWatch monitoring and analytics',
          'Comprehensive security and performance optimizations'
        ],
        breaking: [],
        fixes: [],
        notes: 'First production-ready version of the personal introduction site'
      }
    ],

    // Planned releases
    roadmap: [
      {
        version: '1.1.0',
        plannedDate: '2024-04-15',
        type: 'minor',
        description: 'Enhanced analytics and additional features',
        features: [
          'Analytics dashboard',
          'Additional pitch templates',
          'Multi-language support',
          'Advanced rate limiting'
        ]
      },
      {
        version: '1.2.0',
        plannedDate: '2024-07-15',
        type: 'minor',
        description: 'Content and integration enhancements',
        features: [
          'Real-time chat integration',
          'Portfolio showcase section',
          'Blog integration',
          'Advanced SEO optimizations'
        ]
      },
      {
        version: '2.0.0',
        plannedDate: '2024-10-15',
        type: 'major',
        description: 'Major redesign and architecture improvements',
        features: [
          'Complete UI redesign',
          'GraphQL API migration',
          'Advanced personalization',
          'Enhanced mobile experience'
        ],
        breaking: [
          'API endpoint changes',
          'Database schema updates',
          'Configuration format changes'
        ]
      }
    ]
  },

  // Build configuration
  build: {
    // Build metadata to include
    metadata: [
      'version',
      'buildTime',
      'commitHash',
      'branch',
      'environment',
      'nodeVersion'
    ],

    // Build artifacts
    artifacts: {
      // Files to include version information in
      versionFiles: [
        'version-info.json',
        'public/version.txt'
      ],

      // Build output directories
      outputDirs: [
        '.next',
        'dist'
      ]
    }
  },

  // Environment configuration
  environments: {
    development: {
      stage: 'dev',
      domain: 'dev.marko.dev',
      apiUrl: 'https://api-dev.marko.dev',
      features: {
        debugging: true,
        analytics: false,
        monitoring: 'basic'
      }
    },
    
    staging: {
      stage: 'staging',
      domain: 'staging.marko.dev',
      apiUrl: 'https://api-staging.marko.dev',
      features: {
        debugging: false,
        analytics: true,
        monitoring: 'full'
      }
    },
    
    production: {
      stage: 'prod',
      domain: 'marko.dev',
      apiUrl: 'https://api.marko.dev',
      features: {
        debugging: false,
        analytics: true,
        monitoring: 'full'
      }
    }
  },

  // Deployment configuration
  deployment: {
    // Deployment targets
    targets: {
      development: {
        provider: 'amplify',
        branch: 'develop',
        autoDeployment: true,
        environment: 'dev'
      },
      
      staging: {
        provider: 'amplify',
        branch: 'staging',
        autoDeployment: true,
        environment: 'staging'
      },
      
      production: {
        provider: 'amplify',
        branch: 'main',
        autoDeployment: true,
        environment: 'prod'
      }
    },

    // Deployment validation
    validation: {
      required: [
        'health-check',
        'environment-variables',
        'api-endpoints',
        'database-connectivity'
      ],
      
      optional: [
        'performance-tests',
        'security-scan',
        'accessibility-audit'
      ]
    }
  },

  // Monitoring configuration
  monitoring: {
    // Version-related metrics
    metrics: [
      'deployment_version',
      'build_duration',
      'deployment_success_rate',
      'version_rollback_count'
    ],

    // Alerts for version-related issues
    alerts: [
      'deployment_failure',
      'version_mismatch',
      'build_timeout',
      'rollback_triggered'
    ]
  }
};