export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Marko",
        "jobTitle": "Full-Stack Developer & Cloud Consultant",
        "description": "Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions.",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "https://marko.business",
        "sameAs": [
            // Add your social media profiles here when available
            // "https://linkedin.com/in/marko",
            // "https://github.com/marko",
            // "https://twitter.com/marko"
        ],
        "knowsAbout": [
            "Cloud Computing",
            "AWS",
            "Serverless Architecture",
            "Automation",
            "Artificial Intelligence",
            "Full-Stack Development",
            "DevOps",
            "CI/CD Pipelines",
            "Infrastructure as Code",
            "Next.js",
            "React",
            "Node.js",
            "Lambda Functions",
            "API Development"
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

    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Marko - AI • Cloud • Automation",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "https://marko.business",
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationData),
                }}
            />
        </>
    );
}