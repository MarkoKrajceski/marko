'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Mouse Position Hook ──────────────────────────────────────────────────────
function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => {
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return pos;
}

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed: number, startTyping: boolean) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!startTyping) return;
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, startTyping]);
  return displayed;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
const ACCENT = '#ef4444';

const MANIFESTO_LINES = [
  { text: 'Typography is', weight: 300, size: 'text-3xl md:text-5xl lg:text-7xl', serif: false },
  { text: 'the voice', weight: 700, size: 'text-5xl md:text-7xl lg:text-9xl', serif: true },
  { text: 'of design.', weight: 300, size: 'text-4xl md:text-6xl lg:text-8xl', serif: false },
  { text: 'It whispers,', weight: 400, size: 'text-2xl md:text-4xl lg:text-6xl', serif: true },
  { text: 'IT SCREAMS,', weight: 900, size: 'text-5xl md:text-8xl lg:text-[10rem]', serif: false, accent: true },
  { text: 'it breathes.', weight: 300, size: 'text-3xl md:text-5xl lg:text-7xl', serif: true },
];

const SLIDE_LINES = [
  'Form follows function',
  'Less is more',
  'God is in the details',
  'Space is substance',
  'Type is a beautiful group of letters',
  'Design is thinking made visual',
];

const SPIN_WORDS = ['MOVE', 'SHIFT', 'TURN', 'FLOW', 'SPIN', 'RISE'];

const WORK_SAMPLES = [
  { title: 'Editorial Systems', subtitle: 'Typography & Layout', year: '2024' },
  { title: 'Brand Identity', subtitle: 'Visual Language', year: '2024' },
  { title: 'Motion Design', subtitle: 'Kinetic Typography', year: '2025' },
  { title: 'Web Experiences', subtitle: 'Interactive Design', year: '2025' },
  { title: 'Type Specimens', subtitle: 'Font Exploration', year: '2024' },
  { title: 'Poster Series', subtitle: 'Swiss Design', year: '2025' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroLetter({ char, index, total }: { char: string; index: number; total: number }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100 + index * 120);
    return () => clearTimeout(t);
  }, [index]);

  const directions = [
    'translate(-100vw, -50vh) rotate(-45deg)',
    'translate(0, -100vh) rotate(15deg)',
    'translate(100vw, -30vh) rotate(30deg)',
    'translate(-80vw, 50vh) rotate(-60deg)',
    'translate(50vw, 100vh) rotate(45deg)',
    'translate(100vw, 0) rotate(-20deg)',
    'translate(-50vw, 100vh) rotate(60deg)',
  ];

  return (
    <span
      className="inline-block will-change-transform"
      style={{
        fontFamily: index % 2 === 0 ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, sans-serif',
        fontWeight: index === total - 1 ? 300 : 800,
        color: index === 3 ? ACCENT : 'white',
        fontSize: 'clamp(80px, 20vw, 280px)',
        lineHeight: 0.85,
        letterSpacing: '-0.04em',
        transform: loaded ? 'translate(0,0) rotate(0deg)' : directions[index % directions.length],
        opacity: loaded ? 1 : 0,
        transition: `transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s, opacity 0.8s ease-out ${index * 0.08}s`,
      }}
    >
      {char}
    </span>
  );
}

function SlideLine({ text, index }: { text: string; index: number }) {
  const { ref, inView } = useInView(0.2);
  const fromLeft = index % 2 === 0;
  return (
    <div ref={ref} className="overflow-hidden py-2 md:py-4">
      <p
        className="text-2xl md:text-4xl lg:text-6xl font-light tracking-wide"
        style={{
          fontFamily: index % 2 === 0 ? 'system-ui, sans-serif' : 'Georgia, serif',
          color: index === 2 ? ACCENT : 'rgba(255,255,255,0.85)',
          transform: inView
            ? 'translateX(0)'
            : fromLeft ? 'translateX(-110%)' : 'translateX(110%)',
          opacity: inView ? 1 : 0,
          transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s, opacity 0.6s ease-out ${index * 0.1}s`,
          textAlign: fromLeft ? 'left' : 'right',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </p>
    </div>
  );
}

function SpinWord({ word, index }: { word: string; index: number }) {
  const { ref, inView } = useInView(0.3);
  return (
    <div ref={ref} className="flex items-center justify-center">
      <span
        className="block text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter"
        style={{
          fontFamily: 'system-ui, sans-serif',
          color: index === 1 ? ACCENT : 'white',
          transform: inView
            ? 'rotateX(0deg) rotateY(0deg) scale(1)'
            : `rotateX(${90 - index * 30}deg) rotateY(${index * 45}deg) scale(0.3)`,
          opacity: inView ? 1 : 0,
          transition: `transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.12}s, opacity 0.5s ease-out ${index * 0.12}s`,
          perspective: '600px',
        }}
      >
        {word}
      </span>
    </div>
  );
}

function WorkPattern({ index, hovered }: { index: number; hovered: boolean }) {
  // Each index gets a unique pure-CSS / SVG pattern. All monochrome + red accent.
  const baseOpacity = hovered ? 0.55 : 0.22;
  const transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

  // 0 — Editorial Systems: halftone dot grid fading from top-left
  if (index === 0) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #18181b, #0f0f10)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.9) 1.1px, transparent 1.4px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(ellipse at 10% 10%, black 10%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 10% 10%, black 10%, transparent 75%)',
            opacity: baseOpacity,
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition,
          }}
        />
        <div
          className="absolute"
          style={{
            top: '18%',
            left: '14%',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: ACCENT,
            opacity: hovered ? 1 : 0.6,
            transition: 'opacity 0.4s ease',
          }}
        />
      </>
    );
  }

  // 1 — Brand Identity: diagonal stripes (white/black/red)
  if (index === 1) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #18181b, #0f0f10)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.85) 0 14px, transparent 14px 28px, ${ACCENT} 28px 30px, transparent 30px 56px)`,
            opacity: baseOpacity,
            transform: hovered ? 'translate(-8px, -8px) scale(1.05)' : 'translate(0,0) scale(1)',
            transition,
          }}
        />
      </>
    );
  }

  // 2 — Motion Design: isometric / blueprint grid (red-tinted)
  if (index === 2) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${ACCENT}18, #120808)` }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(30deg, rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(-30deg, rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`,
            backgroundSize: '34px 58px, 34px 58px, 102px 102px',
            opacity: baseOpacity,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition,
          }}
        />
      </>
    );
  }

  // 3 — Web Experiences: concentric circles / radar rings
  if (index === 3) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #18181b, #0f0f10)' }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
          style={{
            opacity: baseOpacity,
            transform: hovered ? 'scale(1.06) rotate(4deg)' : 'scale(1) rotate(0deg)',
            transformOrigin: '70% 60%',
            transition,
          }}
        >
          {[18, 34, 52, 72, 94, 118, 144].map((r, i) => (
            <circle
              key={i}
              cx="140"
              cy="120"
              r={r}
              fill="none"
              stroke={i === 3 ? ACCENT : 'rgba(255,255,255,0.85)'}
              strokeWidth={i === 3 ? 1.4 : 0.8}
            />
          ))}
          <circle cx="140" cy="120" r="3" fill={ACCENT} />
        </svg>
      </>
    );
  }

  // 4 — Type Specimens: typography pattern (ghosted giant A + repeating g)
  if (index === 4) {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #18181b, #0f0f10)' }}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: baseOpacity,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition,
          }}
        >
          <span
            className="absolute select-none"
            style={{
              left: '-6%',
              top: '-22%',
              fontFamily: 'Georgia, serif',
              fontWeight: 900,
              fontSize: '20rem',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            Aa
          </span>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0, rgba(0,0,0,0.35) 70%)',
            }}
          />
          <span
            className="absolute"
            style={{
              right: '8%',
              bottom: '10%',
              fontFamily: 'Georgia, serif',
              fontSize: '0.7rem',
              letterSpacing: '0.4em',
              color: ACCENT,
              textTransform: 'uppercase',
            }}
          >
            a a a a
          </span>
        </div>
      </>
    );
  }

  // 5 — Poster Series: wavy interference lines
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #18181b, #0f0f10)' }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        style={{
          opacity: baseOpacity,
          transform: hovered ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)',
          transition,
        }}
      >
        {Array.from({ length: 28 }).map((_, i) => {
          const y = 6 + i * 7;
          const amp = 3 + (i % 5);
          const d = `M0 ${y} Q 50 ${y - amp}, 100 ${y} T 200 ${y}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i === 12 ? ACCENT : 'rgba(255,255,255,0.85)'}
              strokeWidth={i === 12 ? 1.2 : 0.6}
            />
          );
        })}
      </svg>
    </>
  );
}

function WorkCard({ item, index }: { item: typeof WORK_SAMPLES[0]; index: number }) {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  const heights = ['h-48 md:h-64', 'h-56 md:h-80', 'h-44 md:h-72', 'h-52 md:h-96', 'h-48 md:h-64', 'h-60 md:h-80'];
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden cursor-pointer group ${heights[index]}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(60px)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
        marginTop: index % 2 === 0 ? '0' : '2rem',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <WorkPattern index={index} hovered={hovered} />
      </div>
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 md:p-8"
        style={{
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
          transition: 'background 0.4s ease',
        }}
      >
        <span
          className="text-xs tracking-widest uppercase mb-2"
          style={{
            color: ACCENT,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.4s ease 0.05s',
          }}
        >
          {item.year}
        </span>
        <h3
          className="text-lg md:text-2xl font-bold tracking-tight"
          style={{
            color: 'white',
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'transform 0.4s ease 0.1s',
          }}
        >
          {item.title}
        </h3>
        <p
          className="text-sm font-light tracking-wide mt-1"
          style={{
            color: 'rgba(255,255,255,0.6)',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.4s ease 0.15s',
          }}
        >
          {item.subtitle}
        </p>
      </div>
      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-8 h-8"
        style={{
          borderTop: `2px solid ${hovered ? ACCENT : 'rgba(255,255,255,0.1)'}`,
          borderRight: `2px solid ${hovered ? ACCENT : 'rgba(255,255,255,0.1)'}`,
          transition: 'border-color 0.4s ease',
        }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KineticPage() {
  const mouse = useMouse();
  const [subtitleReady, setSubtitleReady] = useState(false);

  const manifestoRef = useInView(0.1);
  const splitRef = useInView(0.2);
  const split2Ref = useInView(0.2);
  const typewriterTrigger = useInView(0.3);
  const sparseRef = useInView(0.2);
  const footerRef = useInView(0.2);

  const typewriterText = useTypewriter(
    'We shape our tools, and thereafter our tools shape us.',
    55,
    typewriterTrigger.inView
  );

  useEffect(() => {
    const t = setTimeout(() => setSubtitleReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const heroLetters = 'KINETIC'.split('');

  return (
    <main
      className="relative overflow-x-hidden"
      style={{
        background: '#0a0a0a',
        color: 'white',
        cursor: 'default',
        minHeight: '100vh',
        fontFamily: 'Georgia, "Times New Roman", ui-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating accent dot */}
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: ACCENT,
            top: '20%',
            right: '15%',
            transform: `translate(${mouse.x * -20}px, ${mouse.y * -20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: 'white',
            bottom: '30%',
            left: '20%',
            transform: `translate(${mouse.x * 15}px, ${mouse.y * 15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Main title */}
        <div
          className="relative text-center select-none"
          style={{
            transform: `translate(${mouse.x * -8}px, ${mouse.y * -5}px)`,
            transition: 'transform 0.4s ease-out',
          }}
        >
          <div className="flex items-baseline justify-center flex-wrap">
            {heroLetters.map((char, i) => (
              <HeroLetter key={i} char={char} index={i} total={heroLetters.length} />
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div
          className="mt-8 md:mt-12 text-center"
          style={{
            opacity: subtitleReady ? 1 : 0,
            transform: subtitleReady ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p
            className="text-xs md:text-sm tracking-[0.4em] uppercase font-light"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'system-ui, sans-serif' }}
          >
            Motion Typography
          </p>
          <div
            className="mt-6 w-12 h-px mx-auto"
            style={{ background: ACCENT }}
          />
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            opacity: subtitleReady ? 1 : 0,
            transition: 'opacity 1s ease 0.5s',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Scroll
            </span>
            <div
              className="w-px h-8"
              style={{
                background: 'rgba(255,255,255,0.15)',
                animation: 'scrollPulse 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE TICKER ═══ */}
      <section className="py-6 overflow-hidden border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex items-center shrink-0">
              {['KINETIC', 'TYPOGRAPHY', 'MOTION', 'DESIGN', 'EDITORIAL', 'SWISS'].map((word, i) => (
                <span key={i} className="flex items-center">
                  <span
                    className="text-sm md:text-lg tracking-[0.3em] uppercase font-light mx-6 md:mx-10"
                    style={{
                      color: word === 'KINETIC' ? ACCENT : 'rgba(255,255,255,0.2)',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {word}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SLIDE-IN LINES ═══ */}
      <section className="py-24 md:py-40 px-6 md:px-16 lg:px-32 max-w-7xl mx-auto">
        <p
          className="text-[10px] tracking-[0.5em] uppercase mb-12 md:mb-20"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          01 / Principles
        </p>
        {SLIDE_LINES.map((line, i) => (
          <SlideLine key={i} text={line} index={i} />
        ))}
      </section>

      {/* ═══ MANIFESTO ═══ */}
      <section
        ref={manifestoRef.ref}
        className="py-24 md:py-48 px-6 md:px-16 lg:px-24"
        style={{ background: '#050505' }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-16 md:mb-24"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            02 / Manifesto
          </p>
          <div className="space-y-3 md:space-y-6">
            {MANIFESTO_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  opacity: manifestoRef.inView ? 1 : 0,
                  transform: manifestoRef.inView ? 'translateY(0)' : 'translateY(40px)',
                  transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
                }}
              >
                <p
                  className={`${line.size} leading-none`}
                  style={{
                    fontFamily: line.serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, sans-serif',
                    fontWeight: line.weight,
                    color: line.accent ? ACCENT : 'white',
                    letterSpacing: line.weight >= 700 ? '-0.03em' : '0.02em',
                  }}
                >
                  {line.text}
                </p>
              </div>
            ))}
          </div>

          {/* Editorial pull quote */}
          <div
            className="mt-20 md:mt-32 pl-6 md:pl-12 border-l-2"
            style={{
              borderColor: ACCENT,
              opacity: manifestoRef.inView ? 1 : 0,
              transform: manifestoRef.inView ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'all 1s ease 1s',
            }}
          >
            <blockquote
              className="text-xl md:text-3xl lg:text-4xl font-light italic leading-relaxed"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              &ldquo;The details are not the details.
              <br />
              They make the design.&rdquo;
            </blockquote>
            <cite
              className="block mt-4 text-xs tracking-[0.3em] uppercase not-italic"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Charles Eames
            </cite>
          </div>
        </div>
      </section>

      {/* ═══ SPINNING WORDS ═══ */}
      <section className="py-24 md:py-40 px-6">
        <p
          className="text-[10px] tracking-[0.5em] uppercase mb-16 md:mb-24 text-center"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          03 / Kinesis
        </p>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto"
          style={{ perspective: '800px' }}
        >
          {SPIN_WORDS.map((word, i) => (
            <SpinWord key={i} word={word} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ SPLIT SCREEN 1 ═══ */}
      <section
        ref={splitRef.ref}
        className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] md:min-h-screen"
      >
        {/* Left: Giant letter */}
        <div
          className="relative flex items-center justify-center overflow-hidden py-20 md:py-0"
          style={{ background: '#111' }}
        >
          <span
            className="select-none"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(200px, 45vw, 500px)',
              fontWeight: 200,
              lineHeight: 0.8,
              color: 'rgba(255,255,255,0.04)',
              transform: splitRef.inView
                ? `translate(${mouse.x * -12}px, ${mouse.y * -8}px)`
                : 'scale(0.8)',
              opacity: splitRef.inView ? 1 : 0,
              transition: splitRef.inView
                ? 'transform 0.3s ease-out'
                : 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            K
          </span>
          {/* Accent line */}
          <div
            className="absolute bottom-12 left-8 md:left-12 w-16 h-px"
            style={{
              background: ACCENT,
              transform: splitRef.inView ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.8s ease 0.3s',
            }}
          />
        </div>
        {/* Right: Text */}
        <div className="flex items-center px-8 md:px-16 py-20 md:py-0">
          <div
            style={{
              opacity: splitRef.inView ? 1 : 0,
              transform: splitRef.inView ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}
          >
            <span
              className="text-[10px] tracking-[0.5em] uppercase block mb-6"
              style={{ color: ACCENT }}
            >
              04 / Philosophy
            </span>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Letters are
              <br />
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontStyle: 'italic' }}>
                architecture
              </span>
            </h2>
            <p
              className="text-sm md:text-base font-light leading-relaxed max-w-md"
              style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}
            >
              Every letterform carries weight, rhythm, and intention. In kinetic typography,
              we give these silent structures a voice through motion and time.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECOND MARQUEE (reverse direction) ═══ */}
      <section className="py-6 overflow-hidden border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'marqueeReverse 20s linear infinite' }}>
          {[...Array(4)].map((_, rep) => (
            <span
              key={rep}
              className="text-[10vw] md:text-[6vw] font-black tracking-tighter shrink-0 mx-4"
              style={{
                fontFamily: 'system-ui, sans-serif',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.08)',
              }}
            >
              MOTION IS EMOTION&nbsp;&nbsp;&bull;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </section>

      {/* ═══ SPLIT SCREEN 2 ═══ */}
      <section
        ref={split2Ref.ref}
        className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh] md:min-h-[80vh]"
      >
        {/* Left: Text */}
        <div
          className="flex items-center px-8 md:px-16 py-20 md:py-0 order-2 md:order-1"
          style={{
            opacity: split2Ref.inView ? 1 : 0,
            transform: split2Ref.inView ? 'translateX(0)' : 'translateX(-60px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <div>
            <span
              className="text-[10px] tracking-[0.5em] uppercase block mb-6"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              05 / Rhythm
            </span>
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Space
              <span className="font-bold" style={{ fontFamily: 'system-ui, sans-serif', color: ACCENT }}> defines </span>
              meaning
            </h2>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <p
                className="text-xs tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Whitespace is not empty
              </p>
            </div>
          </div>
        </div>
        {/* Right: Giant letter */}
        <div
          className="relative flex items-center justify-center overflow-hidden order-1 md:order-2 py-20 md:py-0"
          style={{ background: '#0f0f0f' }}
        >
          <span
            className="select-none"
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 'clamp(180px, 40vw, 450px)',
              fontWeight: 900,
              lineHeight: 0.8,
              color: 'transparent',
              WebkitTextStroke: `2px ${ACCENT}22`,
              transform: split2Ref.inView
                ? `translate(${mouse.x * 10}px, ${mouse.y * 6}px)`
                : 'scale(1.2)',
              opacity: split2Ref.inView ? 1 : 0,
              transition: split2Ref.inView
                ? 'transform 0.3s ease-out'
                : 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            &
          </span>
        </div>
      </section>

      {/* ═══ WORK SAMPLES GRID ═══ */}
      <section className="py-24 md:py-40 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-16 md:mb-24"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            06 / Selected Work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {WORK_SAMPLES.map((item, i) => (
              <WorkCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TYPEWRITER ═══ */}
      <section
        className="py-32 md:py-48 px-6 md:px-16 lg:px-24"
        style={{ background: '#050505' }}
      >
        <div className="max-w-5xl mx-auto" ref={typewriterTrigger.ref}>
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-12 md:mb-16"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            07 / Words
          </p>
          <div className="relative">
            <p
              className="text-2xl md:text-4xl lg:text-5xl font-light leading-snug"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: 'rgba(255,255,255,0.8)',
                minHeight: '3em',
              }}
            >
              {typewriterText}
              <span
                className="inline-block w-[2px] md:w-[3px] h-[1em] ml-1 align-baseline"
                style={{
                  background: ACCENT,
                  animation: 'blink 0.8s ease-in-out infinite',
                }}
              />
            </p>
          </div>
          <div
            className="mt-8 flex items-center gap-3"
            style={{
              opacity: typewriterTrigger.inView ? 1 : 0,
              transition: 'opacity 1s ease 3s',
            }}
          >
            <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Marshall McLuhan (attributed)
            </span>
          </div>
        </div>
      </section>

      {/* ═══ SPARSE WHITESPACE SECTION ═══ */}
      <section
        ref={sparseRef.ref}
        className="min-h-[70vh] md:min-h-screen flex items-center justify-center px-6 relative"
      >
        <div
          className="text-center"
          style={{
            opacity: sparseRef.inView ? 1 : 0,
            transform: sparseRef.inView
              ? `translate(${mouse.x * -6}px, ${mouse.y * -4}px)`
              : 'scale(0.95)',
            transition: sparseRef.inView
              ? 'transform 0.3s ease-out, opacity 1.5s ease'
              : 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-16"
            style={{ color: 'rgba(255,255,255,0.15)' }}
          >
            08 / Silence
          </p>
          <h2
            className="text-5xl md:text-7xl lg:text-9xl font-extralight tracking-[0.2em] uppercase"
            style={{
              fontFamily: 'system-ui, sans-serif',
              color: 'rgba(255,255,255,0.06)',
            }}
          >
            Breathe
          </h2>
        </div>
        {/* Tiny accent */}
        <div
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ACCENT,
            bottom: '25%',
            right: '30%',
            opacity: sparseRef.inView ? 1 : 0,
            transition: 'opacity 2s ease 1s',
          }}
        />
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        ref={footerRef.ref}
        className="py-20 md:py-32 px-6 md:px-16 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
            style={{
              opacity: footerRef.inView ? 1 : 0,
              transform: footerRef.inView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                A frontend showcase by
              </p>
              <p
                className="text-2xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                Marko
                <span style={{ color: ACCENT }}> Krajcheski</span>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                Kinetic Typography / 2025
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ GLOBAL KEYFRAMES ═══ */}
      <style jsx global>{`
        html, body {
          background: #0a0a0a;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.15; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(1.3); }
        }

        /* Smooth scrolling */
        html { scroll-behavior: smooth; }

        /* Hide scrollbar for cleaner aesthetic */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }

        /* Selection color */
        ::selection {
          background: ${ACCENT}44;
          color: white;
        }
      `}</style>
    </main>
  );
}
