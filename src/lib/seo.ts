import { Metadata } from 'next';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
}

export function generateSEO(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marko.business';
  
  const {
    title = 'Marko - AI • Cloud • Automation Expert',
    description = 'Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions. I help businesses automate the boring and scale the bold.',
    keywords = [
      'cloud consultant', 'serverless architecture', 'AWS expert', 'automation engineer', 
      'AI solutions', 'full-stack developer', 'Next.js', 'Lambda functions', 
      'DevOps', 'CI/CD pipelines', 'infrastructure as code', 'cloud migration'
    ],
    image = '/og-image.jpg',
    url = '/',
    type = 'website'
  } = config;

  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title,
      description,
      siteName: 'Marko - Cloud & AI Solutions',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@marko',
      site: '@marko',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Predefined SEO configs for common pages
export const seoConfigs = {
  home: {
    title: 'Marko - AI • Cloud • Automation Expert',
    description: 'Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions. I help businesses automate the boring and scale the bold.',
    url: '/',
  },
  demo: {
    title: 'Live Demo - AI Pitch Generator | Marko',
    description: 'Experience real-time AI pitch generation powered by AWS Lambda. See how I build scalable serverless applications with practical AI integration.',
    url: '/#demo',
  },
  contact: {
    title: 'Get in Touch - Cloud & AI Consulting | Marko',
    description: 'Ready to automate the boring and scale the bold? Contact me for cloud architecture consulting, serverless development, and applied AI solutions.',
    url: '/#contact',
  },
} as const;

// Schema.org structured data generators
export function generatePersonSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marko.business';
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Marko",
    "jobTitle": "Full-Stack Developer & Cloud Consultant",
    "description": "Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions.",
    "url": baseUrl,
    "image": `${baseUrl}/og-image.jpg`,
    "sameAs": [
      // Add your social media profiles here
      // "https://linkedin.com/in/marko",
      // "https://github.com/marko",
      // "https://twitter.com/marko"
    ],
    "knowsAbout": [
      "Cloud Computing", "AWS", "Serverless Architecture", "Automation",
      "Artificial Intelligence", "Full-Stack Development", "DevOps",
      "CI/CD Pipelines", "Infrastructure as Code", "Next.js", "React",
      "Node.js", "Lambda Functions", "API Development"
    ],
    "offers": {
      "@type": "Service",
      "serviceType": "Cloud Consulting & Development",
      "description": "Cloud architecture consulting, serverless application development, automation pipeline implementation, and applied AI solutions."
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MK"
    }
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marko.business';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Marko - AI • Cloud • Automation",
    "url": baseUrl,
    "logo": `${baseUrl}/favicon.svg`,
    "description": "Expert cloud consulting and full-stack development services specializing in serverless architecture, automation, and applied AI solutions.",
    "founder": {
      "@type": "Person",
      "name": "Marko"
    },
    "serviceArea": {
      "@type": "Place",
      "name": "Global"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cloud & Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cloud & Serverless Architecture",
            "description": "Build scalable, cost-effective solutions with AWS Lambda, API Gateway, and serverless architectures."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Automation Pipelines",
            "description": "Design and implement CI/CD pipelines, infrastructure as code, and automated workflows."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Applied AI Solutions",
            "description": "Integrate practical AI solutions into existing workflows, focusing on real business value."
          }
        }
      ]
    }
  };
}