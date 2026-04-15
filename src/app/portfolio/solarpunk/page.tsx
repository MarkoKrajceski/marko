'use client';

import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Solarpunk Eco-Futurism Dashboard -- Portfolio Showcase
// ---------------------------------------------------------------------------

// ---- Animated counter hook ------------------------------------------------
function useCounter(end: number, duration = 2000, decimals = 0, startOn = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startOn) return;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Number((eased * end).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, decimals, startOn]);
  return value;
}

// ---- Intersection observer hook -------------------------------------------
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ---- Clock hook -----------------------------------------------------------
function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ---- Floating particles component -----------------------------------------
// Pre-computed deterministic particle positions to avoid SSR/client hydration
// mismatches. Values picked once by hand so they look organic but stable.
const PARTICLE_SEED: { x: number; y: number; size: number; dur: number; delay: number; opacity: number; shape: 'circle' | 'leaf' }[] = [
  { x: 8,  y: 12, size: 10, dur: 18, delay: -3,  opacity: 0.14, shape: 'circle' },
  { x: 22, y: 30, size: 6,  dur: 22, delay: -11, opacity: 0.10, shape: 'leaf'   },
  { x: 35, y: 8,  size: 14, dur: 26, delay: -6,  opacity: 0.18, shape: 'circle' },
  { x: 48, y: 42, size: 8,  dur: 20, delay: -14, opacity: 0.12, shape: 'leaf'   },
  { x: 62, y: 18, size: 12, dur: 24, delay: -2,  opacity: 0.16, shape: 'circle' },
  { x: 75, y: 55, size: 5,  dur: 16, delay: -9,  opacity: 0.09, shape: 'leaf'   },
  { x: 88, y: 25, size: 11, dur: 28, delay: -17, opacity: 0.15, shape: 'circle' },
  { x: 14, y: 68, size: 7,  dur: 19, delay: -5,  opacity: 0.11, shape: 'leaf'   },
  { x: 28, y: 82, size: 13, dur: 30, delay: -12, opacity: 0.17, shape: 'circle' },
  { x: 42, y: 72, size: 6,  dur: 21, delay: -8,  opacity: 0.10, shape: 'leaf'   },
  { x: 55, y: 88, size: 9,  dur: 23, delay: -15, opacity: 0.13, shape: 'circle' },
  { x: 68, y: 78, size: 15, dur: 27, delay: -4,  opacity: 0.19, shape: 'leaf'   },
  { x: 82, y: 92, size: 7,  dur: 17, delay: -10, opacity: 0.11, shape: 'circle' },
  { x: 5,  y: 45, size: 11, dur: 25, delay: -7,  opacity: 0.15, shape: 'leaf'   },
  { x: 92, y: 60, size: 8,  dur: 20, delay: -13, opacity: 0.12, shape: 'circle' },
  { x: 38, y: 55, size: 10, dur: 29, delay: -16, opacity: 0.14, shape: 'leaf'   },
  { x: 58, y: 35, size: 6,  dur: 18, delay: -1,  opacity: 0.09, shape: 'circle' },
  { x: 72, y: 5,  size: 12, dur: 26, delay: -18, opacity: 0.16, shape: 'leaf'   },
];

function Particles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {PARTICLE_SEED.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            background: p.shape === 'circle'
              ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 30% 30%, #6ee7b7 0%, transparent 70%)',
            borderRadius: p.shape === 'leaf' ? '60% 40% 60% 40%' : '50%',
            animation: `floatParticle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ---- SVG progress ring ----------------------------------------------------
function ProgressRing({ value, max, size = 96, stroke = 6, color = '#34d399', label }: {
  value: number; max: number; size?: number; stroke?: number; color?: string; label: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="drop-shadow-lg" style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff10" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(.4,0,.2,1)', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontSize={size * 0.18} fontFamily="monospace" fontWeight={700}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <span className="text-xs text-emerald-300/70 tracking-wider uppercase">{label}</span>
    </div>
  );
}

// ---- Bar chart (CSS-only) -------------------------------------------------
function BarChart({ data, animate }: { data: { label: string; value: number; color: string }[]; animate: boolean }) {
  const max = Math.max(...data.map((d) => d.value));
  const BAR_AREA_HEIGHT = 200; // px -- fixed so percentage heights resolve
  return (
    <div className="w-full">
      {/* Bar area with grid lines */}
      <div className="relative w-full px-1" style={{ height: BAR_AREA_HEIGHT }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-dashed border-emerald-500/10" />
          ))}
        </div>
        {/* Bars row -- explicit height so % heights on children resolve */}
        <div className="relative flex items-end gap-2 sm:gap-3 h-full w-full">
          {data.map((d, i) => {
            const pct = (d.value / max) * 100;
            return (
              <div key={d.label} className="group relative flex-1 h-full flex flex-col justify-end items-center">
                {/* Hover tooltip */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                >
                  <div
                    className="px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap border backdrop-blur-md"
                    style={{
                      background: 'rgba(6,78,59,0.9)',
                      borderColor: `${d.color}55`,
                      color: d.color,
                      boxShadow: `0 0 12px ${d.color}44`,
                    }}
                  >
                    {d.value} GWh
                  </div>
                </div>
                {/* Value label above bar */}
                <span
                  className="text-[10px] font-mono text-emerald-200/70 mb-1 transition-all duration-300"
                  style={{
                    opacity: animate ? 1 : 0,
                    transitionDelay: `${0.6 + i * 0.08}s`,
                  }}
                >
                  {d.value}
                </span>
                {/* The actual bar */}
                <div
                  className="w-full rounded-t-md relative overflow-hidden"
                  style={{
                    height: animate ? `${pct}%` : '0%',
                    background: `linear-gradient(to top, ${d.color} 0%, ${d.color}dd 40%, #6ee7b7 100%)`,
                    transition: `height 1.2s cubic-bezier(.4,0,.2,1) ${i * 0.08}s`,
                    boxShadow: `0 0 16px ${d.color}66, 0 -2px 8px ${d.color}44 inset`,
                    minHeight: animate ? 4 : 0,
                  }}
                >
                  {/* Scanline texture */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: `repeating-linear-gradient(0deg, transparent, transparent 3px, #ffffff22 3px, #ffffff22 4px)`,
                    }}
                  />
                  {/* Top highlight */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{ background: `linear-gradient(to right, transparent, #ecfdf5cc, transparent)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Day labels under the bars */}
      <div className="flex gap-2 sm:gap-3 w-full px-1 mt-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[10px] text-emerald-400/60 uppercase tracking-widest font-medium"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Stat card ------------------------------------------------------------
function StatCard({ title, value, unit, icon, delay = 0, inView }: {
  title: string; value: string; unit: string; icon: React.ReactNode; delay?: number; inView: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl border border-emerald-500/20 p-5 sm:p-6 backdrop-blur-xl overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(6,78,59,0.45) 0%, rgba(6,78,59,0.15) 100%)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `all 0.8s cubic-bezier(.4,0,.2,1) ${delay}s`,
      }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.12) 0%, transparent 70%)' }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-emerald-400/80 text-xs uppercase tracking-[0.2em] font-medium">{title}</span>
        <span className="text-emerald-300/40">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">{value}</span>
        <span className="text-emerald-400/60 text-sm font-medium">{unit}</span>
      </div>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
    </div>
  );
}

// ---- Connected system row -------------------------------------------------
function SystemRow({ name, status, latency, animate, delay }: {
  name: string; status: 'online' | 'syncing' | 'standby'; latency: string; animate: boolean; delay: number;
}) {
  const colors = { online: '#34d399', syncing: '#facc15', standby: '#64748b' };
  const c = colors[status];
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-emerald-500/10 backdrop-blur-md"
      style={{
        background: 'rgba(6,78,59,0.2)',
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateX(0)' : 'translateX(-24px)',
        transition: `all 0.7s cubic-bezier(.4,0,.2,1) ${delay}s`,
      }}>
      <div className="flex items-center gap-3">
        {/* Glowing dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: c, opacity: 0.4, animationDuration: '2s' }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}88` }} />
        </span>
        <span className="text-sm text-emerald-100/90 font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-emerald-400/50">{latency}</span>
        <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
          style={{ color: c, backgroundColor: `${c}18`, border: `1px solid ${c}33` }}>
          {status}
        </span>
      </div>
    </div>
  );
}

// ---- Organic hero SVG background ------------------------------------------
function HeroBgSvg() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grd1" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#022c22" />
          <stop offset="50%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <radialGradient id="glow1" cx="70%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#34d39930" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="glow2" cx="20%" cy="80%" r="40%">
          <stop offset="0%" stopColor="#0d946820" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#grd1)" />
      <rect width="1440" height="900" fill="url(#glow1)" />
      <rect width="1440" height="900" fill="url(#glow2)" />
      {/* Organic flowing curves */}
      <path d="M0 600 C200 520, 400 680, 720 580 S1200 500, 1440 620 L1440 900 L0 900Z" fill="#04362766" />
      <path d="M0 700 C300 640, 500 760, 800 680 S1100 600, 1440 720 L1440 900 L0 900Z" fill="#05453a44" />
      <path d="M0 780 C250 740, 600 820, 900 760 S1300 700, 1440 800 L1440 900 L0 900Z" fill="#064e3b33" />
      {/* Leaf-like decorative shapes */}
      <ellipse cx="1200" cy="200" rx="180" ry="60" transform="rotate(-25 1200 200)" fill="#34d39908" />
      <ellipse cx="200" cy="300" rx="140" ry="45" transform="rotate(15 200 300)" fill="#6ee7b708" />
      <ellipse cx="900" cy="150" rx="120" ry="35" transform="rotate(-10 900 150)" fill="#10b98108" />
      {/* Subtle grid overlay */}
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#34d39908" strokeWidth="0.5" />
      </pattern>
      <rect width="1440" height="900" fill="url(#grid)" />
    </svg>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================
export default function SolarpunkDashboard() {
  const clock = useClock();

  // Sections visibility
  const hero = useInView(0.1);
  const stats = useInView(0.15);
  const rings = useInView(0.15);
  const chart = useInView(0.15);
  const systems = useInView(0.15);
  const footer = useInView(0.1);

  // Animated counters
  const airQuality = useCounter(97.3, 2000, 1, stats.inView);
  const greenCoverage = useCounter(84.6, 2200, 1, stats.inView);
  const waterRecycled = useCounter(12.4, 1800, 1, stats.inView);

  // Ticking energy counter
  const [liveEnergy, setLiveEnergy] = useState(8742);
  useEffect(() => {
    if (!stats.inView) return;
    const id = setInterval(() => setLiveEnergy((v) => v + Math.floor(Math.random() * 3) + 1), 2200);
    return () => clearInterval(id);
  }, [stats.inView]);

  const chartData = [
    { label: 'Mon', value: 72, color: '#34d399' },
    { label: 'Tue', value: 85, color: '#6ee7b7' },
    { label: 'Wed', value: 63, color: '#10b981' },
    { label: 'Thu', value: 91, color: '#34d399' },
    { label: 'Fri', value: 78, color: '#6ee7b7' },
    { label: 'Sat', value: 95, color: '#059669' },
    { label: 'Sun', value: 88, color: '#34d399' },
  ];

  const connectedSystems = [
    { name: 'Solar Array Grid A-7', status: 'online' as const, latency: '12ms' },
    { name: 'Hydroponic Bay 03', status: 'online' as const, latency: '8ms' },
    { name: 'Wind Turbine Cluster NE', status: 'syncing' as const, latency: '34ms' },
    { name: 'Rainwater Reservoir Delta', status: 'online' as const, latency: '5ms' },
    { name: 'Biofilter Station West', status: 'online' as const, latency: '11ms' },
    { name: 'Thermal Storage Unit 02', status: 'standby' as const, latency: '--' },
    { name: 'Mycelium Network Hub', status: 'online' as const, latency: '19ms' },
  ];

  return (
    <>
      {/* ---- Global keyframes ---- */}
      <style>{`
        /* ------------------------------------------------------------------
           Double-scrollbar fix: globals.css sets {html,body} { overflow-x: hidden }.
           Per CSS spec, when overflow-x is 'hidden' and overflow-y is 'visible',
           overflow-y computes to 'auto' — creating a scroll container on BOTH
           html AND body. The result is two side-by-side scrollbars.

           Fix: make html the single scroll container, and force body to
           'overflow: clip' so it never becomes a scroll container.
           ------------------------------------------------------------------ */
        html {
          scroll-snap-type: none !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          height: auto !important;
        }
        body {
          overflow: clip !important;
          height: auto !important;
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.15); }
          50% { transform: translate(-20px, -70px) scale(0.9); }
          75% { transform: translate(40px, -30px) scale(1.05); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes waveform {
          0% { d: path("M0,40 Q30,20 60,40 T120,40 T180,40 T240,40 T300,40"); }
          50% { d: path("M0,40 Q30,55 60,40 T120,40 T180,40 T240,40 T300,40"); }
          100% { d: path("M0,40 Q30,20 60,40 T120,40 T180,40 T240,40 T300,40"); }
        }
        .grain-overlay::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
        }
      `}</style>

      <div
        className="grain-overlay text-white relative"
        style={{
          background: '#022c22',
          minHeight: '100vh',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        }}
      >
        <Particles />

        {/* ================================================================ */}
        {/* HERO                                                            */}
        {/* ================================================================ */}
        <section ref={hero.ref} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
          <HeroBgSvg />

          {/* Animated gradient orb */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #34d399, #0d9488, transparent)',
              animation: 'breathe 8s ease-in-out infinite',
            }} />

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{
            opacity: hero.inView ? 1 : 0,
            transform: hero.inView ? 'translateY(0)' : 'translateY(48px)',
            transition: 'all 1.2s cubic-bezier(.4,0,.2,1)',
          }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md mb-8"
              style={{ background: 'rgba(6,78,59,0.4)' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs text-emerald-300 tracking-widest uppercase font-medium">Live Monitoring</span>
              <span className="text-xs font-mono text-emerald-400/60 ml-1">{clock}</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
              <span className="block" style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #6ee7b7 40%, #34d399 70%, #059669 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 6s ease infinite',
              }}>
                Solarpunk
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.15em] text-emerald-300/70 mt-2">
                ECO-FUTURISM
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-emerald-200/50 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              Real-time environmental intelligence for the cities of tomorrow.
              Monitoring energy, air, water, and green coverage across the urban biome.
            </p>

            {/* Scroll indicator */}
            <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDuration: '2.5s' }}>
              <span className="text-[10px] text-emerald-500/40 uppercase tracking-[0.3em]">Explore</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="#34d39966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#022c22] to-transparent" />
        </section>

        {/* ================================================================ */}
        {/* STATS GRID                                                       */}
        {/* ================================================================ */}
        <section ref={stats.ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-12">
            <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-500/60 mb-2 font-medium">Dashboard Overview</h2>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-50/90">System Metrics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Energy Output" value={liveEnergy.toLocaleString()} unit="MWh"
              delay={0} inView={stats.inView}
              icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11 1L3 12h6l-1 7 8-11h-6l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
            <StatCard
              title="Air Quality" value={airQuality.toFixed(1)} unit="AQI"
              delay={0.1} inView={stats.inView}
              icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h8a3 3 0 100-6H8M2 14h12a3 3 0 110 6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            />
            <StatCard
              title="Green Coverage" value={greenCoverage.toFixed(1)} unit="%"
              delay={0.2} inView={stats.inView}
              icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 18s1-6 4-9c3-3 8-4 8-4s-1 6-4 9-8 4-8 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 9l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            />
            <StatCard
              title="Water Recycled" value={waterRecycled.toFixed(1)} unit="ML"
              delay={0.3} inView={stats.inView}
              icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2s6 5.5 6 10a6 6 0 11-12 0C4 7.5 10 2 10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            />
          </div>
        </section>

        {/* ================================================================ */}
        {/* PROGRESS RINGS + CHART                                           */}
        {/* ================================================================ */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

            {/* Progress Rings Card */}
            <div ref={rings.ref} className="rounded-3xl border border-emerald-500/15 p-6 sm:p-8 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(160deg, rgba(6,78,59,0.35) 0%, rgba(6,78,59,0.1) 100%)',
                opacity: rings.inView ? 1 : 0,
                transform: rings.inView ? 'translateY(0)' : 'translateY(32px)',
                transition: 'all 0.9s cubic-bezier(.4,0,.2,1)',
              }}>
              <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-500/60 mb-8 font-medium">Resource Efficiency</h3>
              <div className="flex flex-wrap justify-around gap-6">
                <ProgressRing value={rings.inView ? 87 : 0} max={100} label="Solar" color="#34d399" />
                <ProgressRing value={rings.inView ? 72 : 0} max={100} label="Wind" color="#6ee7b7" />
                <ProgressRing value={rings.inView ? 94 : 0} max={100} label="Hydro" color="#10b981" />
                <ProgressRing value={rings.inView ? 68 : 0} max={100} label="Bio" color="#059669" />
              </div>
              {/* Summary bar */}
              <div className="mt-8 pt-6 border-t border-emerald-500/10 flex items-center justify-between">
                <span className="text-xs text-emerald-400/50 tracking-wider">Combined Output</span>
                <span className="font-mono text-lg text-emerald-200 font-bold">80.25%</span>
              </div>
            </div>

            {/* Bar Chart Card */}
            <div ref={chart.ref} className="rounded-3xl border border-emerald-500/15 p-6 sm:p-8 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(160deg, rgba(6,78,59,0.35) 0%, rgba(6,78,59,0.1) 100%)',
                opacity: chart.inView ? 1 : 0,
                transform: chart.inView ? 'translateY(0)' : 'translateY(32px)',
                transition: 'all 0.9s cubic-bezier(.4,0,.2,1) 0.15s',
              }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-500/60 font-medium">Weekly Energy Harvest</h3>
                <span className="text-xs font-mono text-emerald-400/40">GWh</span>
              </div>
              <BarChart data={chartData} animate={chart.inView} />
              {/* Trend line */}
              <div className="mt-6 pt-5 border-t border-emerald-500/10 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8l3-3 2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  +12.4%
                </span>
                <span className="text-xs text-emerald-400/40">vs. previous week</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WAVEFORM DECORATION                                              */}
        {/* ================================================================ */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-4 overflow-hidden opacity-20">
          <svg viewBox="0 0 1200 60" className="w-full" preserveAspectRatio="none">
            {Array.from({ length: 40 }, (_, i) => {
              const h = (Math.sin(i * 0.5) * 12 + 14) * 2;
              const h2 = (Math.cos(i * 0.7) * 10 + 12) * 2;
              const y = 30 - (Math.sin(i * 0.5) * 12 + 14);
              const y2 = 30 - (Math.cos(i * 0.7) * 10 + 12);
              // Deterministic duration based on index (no Math.random for SSR safety)
              const dur = `${(2 + ((i * 37) % 20) / 10).toFixed(1)}s`;
              return (
                <rect
                  key={i}
                  x={i * 30 + 2}
                  y={y}
                  width="4"
                  height={h}
                  rx="2"
                  fill="#34d399"
                  opacity={0.3 + Math.sin(i * 0.3) * 0.3}
                >
                  <animate attributeName="height" values={`${h};${h2};${h}`} dur={dur} repeatCount="indefinite" />
                  <animate attributeName="y" values={`${y};${y2};${y}`} dur={dur} repeatCount="indefinite" />
                </rect>
              );
            })}
          </svg>
        </div>

        {/* ================================================================ */}
        {/* CONNECTED SYSTEMS                                                */}
        {/* ================================================================ */}
        <section ref={systems.ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-500/60 mb-2 font-medium">Network</h2>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-50/90">Connected Systems</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectedSystems.map((s, i) => (
              <SystemRow key={s.name} {...s} animate={systems.inView} delay={i * 0.07} />
            ))}
          </div>

          {/* Summary bar */}
          <div className="mt-8 flex flex-wrap items-center gap-6 px-4 py-4 rounded-2xl border border-emerald-500/10 backdrop-blur-md"
            style={{
              background: 'rgba(6,78,59,0.15)',
              opacity: systems.inView ? 1 : 0,
              transition: 'opacity 0.8s 0.6s',
            }}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #34d39988' }} />
              <span className="text-xs text-emerald-300/70">6 Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 8px #facc1588' }} />
              <span className="text-xs text-emerald-300/70">1 Syncing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span className="text-xs text-emerald-300/70">1 Standby</span>
            </div>
            <span className="ml-auto text-xs font-mono text-emerald-400/40">Avg latency: 14.8ms</span>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}
        <footer ref={footer.ref} className="relative z-10 border-t border-emerald-500/10 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center" style={{
            opacity: footer.inView ? 1 : 0,
            transform: footer.inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.9s cubic-bezier(.4,0,.2,1)',
          }}>
            {/* Decorative leaf */}
            <svg className="mx-auto mb-6 opacity-30" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M12 36s2-12 8-18c6-6 16-8 16-8s-2 12-8 18-16 8-16 8z" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 18l-8 8" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <p className="text-emerald-400/40 text-sm tracking-wide mb-2">
              A frontend showcase by{' '}
              <span className="text-emerald-300/70 font-semibold">Marko Krajcheski</span>
            </p>
            <p className="text-emerald-500/30 text-xs tracking-wider">
              Built with Next.js, Tailwind CSS & pure imagination
            </p>

            <div className="mt-8 flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/20" />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
