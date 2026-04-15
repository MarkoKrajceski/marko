# marko.business

My personal website and portfolio — live at **[marko.business](https://marko.business)**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-orange?logo=aws)](https://aws.amazon.com/amplify/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## What it is

I built this site to be more than a static résumé. It introduces what I do — cloud architecture, automation, applied AI, and full-stack development — and links out to a set of frontend showcase projects I designed from scratch to demonstrate range on the design side.

The main site is a single-page experience with snap-scrolling sections. The portfolio showcases are standalone pages with their own design languages, each completely self-contained.

## Portfolio Showcases

| Route | Theme | Highlights |
|---|---|---|
| `/portfolio/solarpunk` | Eco-Futurism Dashboard | Live stat counters, SVG progress rings, animated energy chart, connected systems |
| `/portfolio/synthwave` | Retro Neon Experience | Working Web Audio synthesizer player with 8 tracks, live terminal action log, perspective grid, CRT effects |
| `/portfolio/kinetic` | Motion Typography | Scroll-driven text reveals, typewriter, mouse parallax, editorial layout, SVG work card patterns |
| `/portfolio/glass` | 3D Glassmorphism UI | Mouse-tracking 3D tilt card, prismatic toggle, animated glass modals, floating notification pills |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4.0 |
| Backend | AWS Lambda (Node.js 22), API Gateway |
| Database | DynamoDB (7-day TTL on leads) |
| Hosting | AWS Amplify (SSR + CDN) |
| Email | AWS SES |
| AI | AWS Bedrock |
| Monitoring | CloudWatch |

## Architecture

```
GitHub → Amplify CI/CD → CloudFront
                        ↓
                   Next.js 15 (SSR)
                        ↓
              API Gateway → Lambda functions
                                ↓
                    DynamoDB / SES / Bedrock
```

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

No environment setup needed — everything falls back to sensible local defaults.

## Scripts

```bash
npm run dev        # Dev server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run analyze    # Bundle analysis
```

## Deployment

Deployed automatically via AWS Amplify on push to `main`. The `amplify.yml` at the root handles both frontend build and backend Lambda deployment.

Environment variables (`NEXT_PUBLIC_API_URL`, `TABLE_NAME`, Lambda URLs, etc.) are injected by the Amplify pipeline — no manual `.env` setup needed in production.

## API

Three Lambda-backed routes:

- `POST /api/lead` — contact form submissions (DynamoDB + SES notification)
- `GET /api/health` — system health check
- (internal) pitch generation via Bedrock

## License

Private. All rights reserved.
