'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Glass - 3D Glassmorphism UI Showcase                              */
/*  A frontend portfolio piece by Marko Krajcheski                    */
/* ------------------------------------------------------------------ */

// ─── Floating notification data ──────────────────────────────────────
const notifications = [
  { icon: '🔔', text: 'New deposit received', sub: '+$2,430.00', delay: -2, duration: 22 },
  { icon: '📈', text: 'Portfolio up 12.4%', sub: 'Last 30 days', delay: -8, duration: 26 },
  { icon: '🛡️', text: 'Security scan passed', sub: 'All systems nominal', delay: -14, duration: 24 },
  { icon: '✉️', text: 'Wire transfer complete', sub: 'To savings account', delay: -20, duration: 28 },
];

// ─── Feature data ────────────────────────────────────────────────────
const features = [
  { icon: '◈', title: 'Adaptive Glass', desc: 'Panels that respond to ambient light, shifting opacity and blur in real time.' },
  { icon: '◇', title: 'Depth Layering', desc: 'Multiple z-levels create a parallax sense of physical depth and dimension.' },
  { icon: '△', title: 'Prismatic Edges', desc: 'Rainbow refractions along borders simulate real optical glass behavior.' },
  { icon: '○', title: 'Motion Blur', desc: 'Smooth animated backgrounds with gaussian blur create living surfaces.' },
  { icon: '▽', title: 'Micro Animations', desc: 'Every interaction triggers subtle, delightful feedback through motion.' },
  { icon: '□', title: 'Light Diffusion', desc: 'Frosted surfaces scatter light naturally, adding warmth to every panel.' },
];

// ─── Plan data ───────────────────────────────────────────────────────
const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/mo',
    blur: 'blur(12px)',
    borderOpacity: 0.12,
    bgOpacity: 0.06,
    features: ['5 Glass Panels', 'Basic Blur Engine', 'Light Mode Only', 'Community Support'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    blur: 'blur(20px)',
    borderOpacity: 0.25,
    bgOpacity: 0.12,
    popular: true,
    features: ['Unlimited Panels', 'Advanced Refraction', 'Dark + Light Modes', 'Priority Support', 'Custom Gradients'],
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/mo',
    blur: 'blur(28px)',
    borderOpacity: 0.18,
    bgOpacity: 0.09,
    features: ['Everything in Pro', 'Depth Engine Pro', 'SSO & Teams', 'SLA Guarantee', 'Dedicated Engineer'],
  },
];

// ─── Plan details (modal content) ────────────────────────────────────
const planDetails: {
  tagline: string;
  description: string;
  accent: string;
  features: string[];
}[] = [
  {
    tagline: 'For solo builders exploring depth.',
    accent: '#38bdf8',
    description:
      'Starter unlocks the essentials of the Glass engine — enough to craft a handful of immersive panels with real-time blur and a clean light theme.',
    features: [
      'Up to 5 glass panels per scene',
      'Adaptive blur radius (2–16px)',
      'Single-layer depth rendering',
      'Light theme presets',
      'Community Discord support',
    ],
  },
  {
    tagline: 'For teams shipping serious glass.',
    accent: '#818cf8',
    description:
      'Pro turns on the full optical stack: multi-layer depth, real-time refraction, prismatic edges, and an adaptive blur that reacts to ambient light.',
    features: [
      'Unlimited glass panels',
      'Multi-layer depth rendering',
      'Real-time refraction engine',
      'Prismatic edge highlights',
      'Dark + light + auto themes',
      'Priority email support',
    ],
  },
  {
    tagline: 'For studios rendering at scale.',
    accent: '#c084fc',
    description:
      'Enterprise delivers the complete Depth Engine Pro with dedicated infrastructure, SSO, and an engineer on call to tune every surface of your product.',
    features: [
      'Everything in Pro',
      'Depth Engine Pro (GPU accelerated)',
      'Chromatic aberration tuning',
      'SSO, SCIM, and team workspaces',
      '99.99% uptime SLA',
      'Dedicated glass engineer',
    ],
  },
];

// ─── Testimonials ────────────────────────────────────────────────────
const testimonials = [
  { name: 'Sarah Chen', role: 'Design Lead, Vercel', quote: 'The depth and clarity of these glass panels is unlike anything I have seen in modern UI. Truly next-level craftsmanship.' },
  { name: 'James Whitfield', role: 'CTO, Luminance', quote: 'We rebuilt our entire dashboard with this glass system. User engagement jumped 40% in the first month.' },
  { name: 'Anika Patel', role: 'Product, Linear', quote: 'It feels like reaching into the screen and touching light. The attention to optical realism is extraordinary.' },
];

// ─── Stats ───────────────────────────────────────────────────────────
const stats = [
  { label: 'Render Speed', value: 94, suffix: '%' },
  { label: 'Glass Clarity', value: 88, suffix: '%' },
  { label: 'Depth Score', value: 97, suffix: '%' },
  { label: 'Refraction Index', value: 1.52, suffix: '', isDecimal: true },
];

/* ================================================================== */
/*  Main Component                                                    */
/* ================================================================== */
export default function GlassPage() {
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [toggleOn, setToggleOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openPlan, setOpenPlan] = useState<number | null>(null);
  const [closingPlan, setClosingPlan] = useState(false);

  // Detect mobile
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll position for parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3D tilt handler for hero card
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !heroCardRef.current) return;
      const rect = heroCardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    },
    [isMobile],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  // Modal: close with fade-out animation
  const closeModal = useCallback(() => {
    setClosingPlan(true);
    window.setTimeout(() => {
      setOpenPlan(null);
      setClosingPlan(false);
    }, 220);
  }, []);

  // Escape key + body scroll lock while modal is open
  useEffect(() => {
    if (openPlan === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [openPlan, closeModal]);

  const heroTransform = isMobile
    ? 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    : `perspective(1000px) rotateY(${mousePos.x * 20}deg) rotateX(${-mousePos.y * 20}deg)`;

  if (!mounted) return null;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#0a0a1a] text-white selection:bg-purple-500/30"
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ────────────────────── GLOBAL KEYFRAME STYLES ────────────────────── */}
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,30px) scale(1.15)} 66%{transform:translate(25px,-40px) scale(0.85)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,40px) scale(1.2)} }
        @keyframes blob4 { 0%,100%{transform:translate(0,0) scale(1)} 25%{transform:translate(-30px,-20px) scale(1.05)} 75%{transform:translate(20px,30px) scale(0.95)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes driftRight { 0%{transform:translateX(-40vw) translateY(0) rotate(-2deg);opacity:0;visibility:visible} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateX(110vw) translateY(-40px) rotate(2deg);opacity:0;visibility:visible} }
        @keyframes knobSpring { 0%{transform:scale(1)} 40%{transform:scale(1.25)} 70%{transform:scale(0.92)} 100%{transform:scale(1)} }
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes progressShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes modalIn { 0%{opacity:0;transform:scale(0.85) translateY(20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes modalOut { 0%{opacity:1;transform:scale(1) translateY(0)} 100%{opacity:0;transform:scale(0.9) translateY(10px)} }
        @keyframes overlayIn { 0%{opacity:0} 100%{opacity:1} }
        @keyframes overlayOut { 0%{opacity:1} 100%{opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes progressFill { 0%{width:0%} 100%{width:var(--target-width)} }
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(60px,-80px)} 50%{transform:translate(-40px,-120px)} 75%{transform:translate(-80px,-30px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-70px,50px)} 50%{transform:translate(50px,90px)} 75%{transform:translate(80px,-20px)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(90px,40px)} 66%{transform:translate(-60px,-60px)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(30px)} 100%{opacity:1;transform:translateY(0)} }
        .glass-prismatic { position:relative; }
        .glass-prismatic::before {
          content:''; position:absolute; inset:-1px; border-radius:inherit; padding:1px;
          background:linear-gradient(135deg,rgba(255,100,100,0.3),rgba(255,200,100,0.2),rgba(100,255,100,0.2),rgba(100,200,255,0.3),rgba(200,100,255,0.3));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          opacity:0.5; transition:opacity 0.3s;
        }
        .glass-prismatic:hover::before { opacity:0.9; }
        .inner-glow {
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3);
        }
        .glass-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      {/* ────────────────────── ANIMATED BACKGROUND ───────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, #1e1b4b 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0c1445 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #1a0a2e 0%, transparent 50%), #08081a',
          }}
        />

        {/* Color blobs */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            top: '10%', left: '15%',
            animation: 'blob1 20s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
            top: '40%', right: '10%',
            animation: 'blob2 25s ease-in-out infinite',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)',
            bottom: '10%', left: '30%',
            animation: 'blob3 22s ease-in-out infinite',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, #f472b6 0%, transparent 70%)',
            top: '60%', left: '60%',
            animation: 'blob4 18s ease-in-out infinite',
            filter: 'blur(70px)',
          }}
        />

        {/* Animated orbs */}
        {[
          { size: 180, color: '#38bdf8', top: '20%', left: '70%', anim: 'orbFloat1', dur: '30s', opacity: 0.15 },
          { size: 240, color: '#818cf8', top: '50%', left: '20%', anim: 'orbFloat2', dur: '35s', opacity: 0.12 },
          { size: 140, color: '#c084fc', top: '70%', left: '80%', anim: 'orbFloat3', dur: '28s', opacity: 0.18 },
          { size: 200, color: '#f472b6', top: '30%', left: '45%', anim: 'orbFloat1', dur: '32s', opacity: 0.1 },
          { size: 100, color: '#67e8f9', top: '80%', left: '10%', anim: 'orbFloat2', dur: '26s', opacity: 0.2 },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              top: orb.top,
              left: orb.left,
              animation: `${orb.anim} ${orb.dur} ease-in-out infinite`,
              opacity: orb.opacity,
              filter: 'blur(40px)',
            }}
          />
        ))}

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* ────────────────────── FLOATING NOTIFICATIONS ────────────────────── */}
      <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${15 + i * 18}%`,
              opacity: 0,
              animation: `driftRight ${n.duration}s linear ${n.delay}s infinite both`,
              willChange: 'transform, opacity',
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-xl">{n.icon}</span>
              <div>
                <div className="text-sm font-medium text-white/90">{n.text}</div>
                <div className="text-xs text-white/50">{n.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ────────────────────── PARALLAX DEPTH LAYERS ─────────────────────── */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {/* Far layer */}
        <div
          className="absolute w-64 h-64 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(2px)',
            border: '1px solid rgba(255,255,255,0.04)',
            top: '20%', right: '5%',
            transform: `translateY(${scrollY * 0.05}px) rotate(12deg)`,
          }}
        />
        {/* Mid layer */}
        <div
          className="absolute w-48 h-48 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.06)',
            top: '50%', left: '3%',
            transform: `translateY(${scrollY * 0.1}px) rotate(-8deg)`,
          }}
        />
        {/* Near layer */}
        <div
          className="absolute w-32 h-32 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
            bottom: '30%', right: '15%',
            transform: `translateY(${scrollY * 0.15}px) rotate(20deg)`,
          }}
        />
      </div>

      {/* ────────────────────── CONTENT ───────────────────────────────────── */}
      <div className="relative z-20">
        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
          <div className="text-center mb-12" style={{ animation: 'slideUp 0.8s ease-out' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-wide text-white/70"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
              Glass Design System v3.0
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 30%, #818cf8 60%, #c084fc 100%)' }}>
                Glass
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto font-light">
              A 3D glassmorphism interface crafted with light, depth, and transparency. Every surface breathes.
            </p>
          </div>

          {/* 3D Tilt Card */}
          <div
            ref={heroCardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-2xl glass-prismatic rounded-3xl"
            style={{
              transform: heroTransform,
              transition: mousePos.x === 0 && mousePos.y === 0 ? 'transform 0.6s ease-out' : 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d',
              animation: 'slideUp 1s ease-out 0.2s both',
            }}
          >
            <div
              className="relative rounded-3xl p-8 sm:p-10 overflow-hidden inner-glow"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* Inner shimmer */}
              <div className="absolute inset-0 glass-shimmer rounded-3xl pointer-events-none" />

              {/* Card content — mock dashboard */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-sm text-white/40 mb-1">Total Balance</div>
                    <div className="text-4xl sm:text-5xl font-bold tracking-tight">$184,392</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-emerald-300" style={{ background: 'rgba(52,211,153,0.12)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                    </svg>
                    +12.4%
                  </div>
                </div>

                {/* Mini chart bars */}
                <div className="flex items-end gap-2 h-24 mb-6">
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all duration-300" style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, rgba(56,189,248,${0.3 + i * 0.05}), rgba(129,140,248,${0.3 + i * 0.05}))`,
                      animationDelay: `${i * 0.05}s`,
                    }} />
                  ))}
                </div>

                {/* Bottom row */}
                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: 'Income', value: '$12,840', color: '#38bdf8' },
                    { label: 'Expenses', value: '$4,320', color: '#f472b6' },
                    { label: 'Savings', value: '$8,520', color: '#818cf8' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 min-w-[100px] rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs text-white/40">{item.label}</span>
                      </div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-white/30" style={{ animation: 'floatSlow 3s ease-in-out infinite' }}>
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </section>

        {/* ─── FEATURES GRID ─────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e0e7ff, #c7d2fe, #a5b4fc)' }}>
                Engineered for Light
              </span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Every panel is a lens. Every surface refracts. Built from the ground up to simulate real optical glass.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group glass-prismatic rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                style={{ animation: `slideUp 0.6s ease-out ${0.1 * i}s both` }}
              >
                <div
                  className="relative rounded-2xl p-6 h-full overflow-hidden inner-glow"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="absolute inset-0 glass-shimmer rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)' }}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── GLASS TOGGLE + STATS BAR ──────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          {/* Toggle */}
          <div className="flex flex-col items-center mb-16">
            <div className="text-sm text-white/40 mb-2 tracking-wide">Glass Refraction Engine</div>
            <div
              key={`mode-${toggleOn ? 'on' : 'off'}`}
              className="text-xs mb-5 tracking-[0.2em] uppercase font-semibold"
              style={{
                background: toggleOn
                  ? 'linear-gradient(90deg,#ff7ab6,#ffb347,#ffe66d,#7cffb2,#7ac8ff,#b57cff,#ff7ab6)'
                  : 'linear-gradient(90deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5))',
                backgroundSize: toggleOn ? '200% 100%' : '100% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: toggleOn ? 'gradientShift 4s ease-in-out infinite' : 'none',
              }}
            >
              {toggleOn ? 'Mode: Prismatic Refraction Active' : 'Mode: Standard Frosted Glass'}
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium transition-colors duration-300 ${!toggleOn ? 'text-white' : 'text-white/30'}`}>Standard</span>
              <button
                onClick={() => setToggleOn(!toggleOn)}
                className="relative w-16 h-8 rounded-full transition-all duration-500 cursor-pointer"
                style={{
                  background: toggleOn ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${toggleOn ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: toggleOn ? '0 0 20px rgba(129,140,248,0.2), inset 0 1px 1px rgba(255,255,255,0.1)' : 'inset 0 1px 1px rgba(255,255,255,0.1)',
                }}
                aria-label="Toggle refraction engine"
                aria-pressed={toggleOn}
              >
                <div
                  key={`knob-${toggleOn ? 'on' : 'off'}`}
                  className="absolute top-1 w-6 h-6 rounded-full"
                  style={{
                    left: toggleOn ? '34px' : '4px',
                    background: toggleOn
                      ? 'conic-gradient(from 0deg,#ff7ab6,#ffb347,#ffe66d,#7cffb2,#7ac8ff,#b57cff,#ff7ab6)'
                      : 'rgba(255,255,255,0.6)',
                    boxShadow: toggleOn
                      ? '0 0 18px rgba(129,140,248,0.7), 0 0 30px rgba(192,132,252,0.35)'
                      : '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.5s cubic-bezier(0.34,1.56,0.64,1), background 0.5s',
                    animation: 'knobSpring 0.55s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors duration-300 ${toggleOn ? 'text-white' : 'text-white/30'}`}>Prismatic</span>
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              padding: toggleOn ? '2px' : '1px',
              background: toggleOn
                ? 'conic-gradient(from 180deg at 50% 50%,#ff7ab6,#ffb347,#ffe66d,#7cffb2,#7ac8ff,#b57cff,#ff7ab6)'
                : 'rgba(255,255,255,0.12)',
              backgroundSize: toggleOn ? '200% 200%' : 'auto',
              animation: toggleOn ? 'gradientShift 6s linear infinite' : 'none',
              boxShadow: toggleOn
                ? '0 0 40px rgba(192,132,252,0.25), 0 0 80px rgba(56,189,248,0.15)'
                : '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'box-shadow 0.6s, padding 0.4s',
            }}
          >
            <div
              className="rounded-2xl p-6 sm:p-8 inner-glow relative overflow-hidden"
              style={{
                background: toggleOn
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.10), rgba(129,140,248,0.12), rgba(192,132,252,0.10))'
                  : 'rgba(255,255,255,0.04)',
                backgroundSize: toggleOn ? '200% 200%' : 'auto',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: toggleOn
                  ? '1px solid rgba(255,255,255,0.18)'
                  : '1px solid rgba(255,255,255,0.10)',
                animation: toggleOn ? 'gradientShift 8s ease-in-out infinite' : 'none',
                transition: 'background 0.6s, border-color 0.6s',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-white/50 font-medium tracking-wide">System Diagnostics</div>
                <div
                  className="text-[10px] px-2 py-0.5 rounded-full tracking-widest uppercase font-semibold transition-all duration-500"
                  style={{
                    background: toggleOn ? 'rgba(192,132,252,0.18)' : 'rgba(255,255,255,0.06)',
                    color: toggleOn ? '#f5d0fe' : 'rgba(255,255,255,0.5)',
                    border: toggleOn ? '1px solid rgba(192,132,252,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {toggleOn ? 'Prismatic' : 'Standard'}
                </div>
              </div>
              <div className="space-y-5">
                {stats.map((stat, i) => {
                  const pct = stat.isDecimal ? (stat.value / 2) * 100 : stat.value;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">{stat.label}</span>
                        <span className="font-semibold text-white/90">
                          {stat.isDecimal ? stat.value : `${stat.value}${stat.suffix}`}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden relative"
                        style={{
                          background: toggleOn ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
                          border: toggleOn ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                          transition: 'background 0.5s, border-color 0.5s',
                        }}
                      >
                        <div
                          className="h-full rounded-full relative"
                          style={{
                            '--target-width': `${pct}%`,
                            width: `${pct}%`,
                            background: toggleOn
                              ? 'linear-gradient(90deg,#ff7ab6,#ffb347,#ffe66d,#7cffb2,#7ac8ff,#b57cff)'
                              : 'linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.35))',
                            backgroundSize: toggleOn ? '200% 100%' : 'auto',
                            animation: toggleOn
                              ? `progressFill 1.5s ease-out ${0.2 * i}s both, gradientShift 3s linear infinite`
                              : `progressFill 1.5s ease-out ${0.2 * i}s both`,
                            boxShadow: toggleOn
                              ? '0 0 14px rgba(192,132,252,0.55), 0 0 24px rgba(56,189,248,0.3)'
                              : 'none',
                            transition: 'background 0.6s, box-shadow 0.6s',
                          } as React.CSSProperties}
                        >
                          {toggleOn && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                backgroundSize: '200% 100%',
                                animation: `progressShimmer ${2 + i * 0.3}s linear infinite`,
                                mixBlendMode: 'overlay',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── PRICING ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)' }}>
                Choose Your Clarity
              </span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">Three tiers of optical perfection. Each panel tuned to a different depth of field.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`glass-prismatic rounded-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 ${plan.popular ? 'md:-translate-y-4' : ''}`}
                style={{ animation: `slideUp 0.6s ease-out ${0.15 * i}s both` }}
              >
                <div
                  className="relative rounded-2xl p-7 overflow-hidden inner-glow"
                  style={{
                    background: `rgba(255,255,255,${plan.bgOpacity})`,
                    backdropFilter: plan.blur,
                    WebkitBackdropFilter: plan.blur,
                    border: `1px solid rgba(255,255,255,${plan.borderOpacity})`,
                  }}
                >
                  <div className="absolute inset-0 glass-shimmer rounded-2xl pointer-events-none" />

                  {plan.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', color: '#fff' }}>
                      Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold mb-1 text-white/80">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => setOpenPlan(i)}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer hover:brightness-110"
                      style={{
                        background: plan.popular ? 'linear-gradient(135deg, #818cf8, #c084fc)' : 'rgba(255,255,255,0.08)',
                        border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                        color: plan.popular ? '#fff' : 'rgba(255,255,255,0.85)',
                        boxShadow: plan.popular ? '0 8px 24px rgba(129,140,248,0.3)' : 'none',
                      }}
                      aria-haspopup="dialog"
                      aria-expanded={openPlan === i}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TESTIMONIALS ──────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e0f2fe, #bae6fd, #7dd3fc)' }}>
                Seen Through Glass
              </span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">What designers and engineers say about building with glass.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass-prismatic rounded-2xl transition-all duration-500 hover:scale-[1.02]"
                style={{ animation: `slideUp 0.6s ease-out ${0.15 * i}s both` }}
              >
                <div
                  className="relative rounded-2xl p-7 h-full overflow-hidden inner-glow"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="absolute inset-0 glass-shimmer rounded-2xl pointer-events-none" />
                  <div className="relative z-10">
                    {/* Quote mark */}
                    <div className="text-4xl font-serif text-indigo-400/30 mb-4 leading-none">&ldquo;</div>
                    <p className="text-sm text-white/60 leading-relaxed mb-6">{t.quote}</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${['#38bdf8', '#818cf8', '#c084fc'][i]}, ${['#818cf8', '#c084fc', '#f472b6'][i]})`,
                        }}
                      >
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/80">{t.name}</div>
                        <div className="text-xs text-white/40">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PLAN MODAL ─────────────────────────────────────────── */}
        {openPlan !== null && (() => {
          const plan = plans[openPlan];
          const detail = planDetails[openPlan];
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="plan-modal-title"
              onClick={closeModal}
              style={{
                background: 'rgba(5,5,20,0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: `${closingPlan ? 'overlayOut' : 'overlayIn'} 0.22s ease-out both`,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl overflow-hidden"
                style={{
                  animation: `${closingPlan ? 'modalOut' : 'modalIn'} 0.35s cubic-bezier(0.34,1.56,0.64,1) both`,
                  padding: '1.5px',
                  background: `conic-gradient(from 120deg at 50% 50%, ${detail.accent}, #ffb347, #7cffb2, #7ac8ff, #b57cff, ${detail.accent})`,
                  backgroundSize: '200% 200%',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(129,140,248,0.25)',
                }}
              >
                {/* Animated gradient backdrop inside border */}
                <div
                  className="relative rounded-[22px] overflow-hidden"
                  style={{
                    background: 'rgba(16,16,38,0.65)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 20% 10%, ${detail.accent}40, transparent 55%), radial-gradient(circle at 80% 90%, #c084fc40, transparent 55%)`,
                      animation: 'gradientShift 10s ease-in-out infinite',
                      backgroundSize: '200% 200%',
                    }}
                  />

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close dialog"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(12px)',
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>

                  <div className="relative p-8 sm:p-10">
                    <div
                      className="inline-block text-[10px] tracking-[0.2em] uppercase font-semibold mb-3 px-2.5 py-1 rounded-full"
                      style={{
                        background: `${detail.accent}22`,
                        border: `1px solid ${detail.accent}55`,
                        color: detail.accent,
                      }}
                    >
                      {plan.name} Plan
                    </div>
                    <h3
                      id="plan-modal-title"
                      className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #ffffff, ${detail.accent})`,
                      }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-5">{detail.tagline}</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    </div>

                    <p className="text-sm text-white/70 leading-relaxed mb-6">{detail.description}</p>

                    <div className="text-[11px] tracking-widest uppercase text-white/40 font-semibold mb-3">
                      Included Features
                    </div>
                    <ul className="space-y-2.5 mb-8">
                      {detail.features.map((feat, k) => (
                        <li
                          key={k}
                          className="flex items-start gap-3 text-sm text-white/80"
                          style={{ animation: `slideUp 0.4s ease-out ${0.05 + k * 0.05}s both` }}
                        >
                          <span
                            className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: `${detail.accent}22`,
                              border: `1px solid ${detail.accent}66`,
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={detail.accent} strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${detail.accent}, #c084fc)`,
                        color: '#fff',
                        boxShadow: `0 10px 30px ${detail.accent}50`,
                      }}
                    >
                      Get Started with {plan.name}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── FOOTER ────────────────────────────────────────────── */}
        <footer className="relative py-16 px-6">
          <div
            className="max-w-4xl mx-auto rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="text-2xl font-bold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)' }}>
              Glass
            </div>
            <p className="text-white/30 text-sm mb-6">Where light meets interface.</p>
            <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <p className="text-white/40 text-sm">
              A frontend showcase by <span className="text-white/70 font-medium">Marko Krajcheski</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
