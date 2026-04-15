'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Star / particle data generated once on mount ───
function generateStars(count: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
}

// ─── Track type ───
type Track = {
  num: string;
  title: string;
  duration: string;
  lengthSec: number;
  // Synthesis parameters
  bpm: number;
  rootFreq: number; // Hz for the tonic
  scale: number[]; // semitone offsets from root
  pattern: number[]; // indices into scale
  bassPattern: number[]; // indices into scale (for bass)
  leadType: OscillatorType;
  bassType: OscillatorType;
  filterCutoff: number;
  detune: number;
};

// Helper to convert semitones to frequency multiplier
const st = (n: number) => Math.pow(2, n / 12);

// ─── Tracks for the mixtape section ───
const TRACKS: Track[] = [
  {
    num: 'A1',
    title: 'Midnight Protocol',
    duration: '0:08',
    lengthSec: 8,
    bpm: 100,
    rootFreq: 220, // A3
    scale: [0, 3, 5, 7, 10, 12, 15], // A minor pentatonic-ish
    pattern: [0, 2, 4, 2, 3, 5, 4, 2],
    bassPattern: [0, 0, 3, 0, 5, 3, 0, 0],
    leadType: 'square',
    bassType: 'sawtooth',
    filterCutoff: 1200,
    detune: 0,
  },
  {
    num: 'A2',
    title: 'Neon Drift',
    duration: '0:08',
    lengthSec: 8,
    bpm: 120,
    rootFreq: 261.63, // C4
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    pattern: [0, 3, 5, 7, 5, 3, 2, 0],
    bassPattern: [0, 0, 0, 0, 5, 5, 3, 3],
    leadType: 'sawtooth',
    bassType: 'sawtooth',
    filterCutoff: 1800,
    detune: 8,
  },
  {
    num: 'A3',
    title: 'Chrome Horizon',
    duration: '0:10',
    lengthSec: 10,
    bpm: 90,
    rootFreq: 196, // G3
    scale: [0, 2, 4, 5, 7, 9, 11, 12],
    pattern: [0, 4, 7, 11, 7, 4, 2, 0],
    bassPattern: [0, 0, 4, 4, 5, 5, 2, 2],
    leadType: 'triangle',
    bassType: 'sawtooth',
    filterCutoff: 900,
    detune: 3,
  },
  {
    num: 'A4',
    title: 'Digital Rain',
    duration: '0:08',
    lengthSec: 8,
    bpm: 140,
    rootFreq: 246.94, // B3
    scale: [0, 2, 3, 5, 7, 8, 10],
    pattern: [0, 2, 3, 5, 3, 2, 5, 7],
    bassPattern: [0, 0, 3, 3, 5, 5, 7, 7],
    leadType: 'square',
    bassType: 'square',
    filterCutoff: 2200,
    detune: 12,
  },
  {
    num: 'B1',
    title: 'Voltage Dreams',
    duration: '0:12',
    lengthSec: 12,
    bpm: 80,
    rootFreq: 174.61, // F3
    scale: [0, 2, 4, 5, 7, 9, 11, 12, 14],
    pattern: [0, 4, 7, 12, 11, 7, 4, 0],
    bassPattern: [0, 0, 0, 7, 5, 5, 5, 0],
    leadType: 'triangle',
    bassType: 'sawtooth',
    filterCutoff: 1100,
    detune: 5,
  },
  {
    num: 'B2',
    title: 'Laser Sunset',
    duration: '0:10',
    lengthSec: 10,
    bpm: 110,
    rootFreq: 293.66, // D4
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    pattern: [12, 10, 7, 5, 7, 10, 12, 7],
    bassPattern: [0, 0, 5, 5, 3, 3, 7, 7],
    leadType: 'sawtooth',
    bassType: 'square',
    filterCutoff: 1600,
    detune: 15,
  },
  {
    num: 'B3',
    title: 'Turbo Lover',
    duration: '0:08',
    lengthSec: 8,
    bpm: 128,
    rootFreq: 220, // A3
    scale: [0, 3, 5, 7, 10, 12],
    pattern: [0, 3, 5, 7, 5, 3, 7, 10],
    bassPattern: [0, 0, 0, 0, 5, 5, 3, 7],
    leadType: 'square',
    bassType: 'sawtooth',
    filterCutoff: 2000,
    detune: 10,
  },
  {
    num: 'B4',
    title: 'Endgame',
    duration: '0:14',
    lengthSec: 14,
    bpm: 70,
    rootFreq: 146.83, // D3
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    pattern: [0, 3, 7, 10, 12, 10, 7, 3],
    bassPattern: [0, 0, 0, 0, 3, 3, 5, 5],
    leadType: 'triangle',
    bassType: 'sawtooth',
    filterCutoff: 800,
    detune: 4,
  },
];

// ─── Feature cards ───
const FEATURES = [
  {
    title: 'CSS-Only Animations',
    desc: 'Every animation on this page runs purely on CSS keyframes. No JS animation libraries needed.',
    icon: '◈',
  },
  {
    title: 'Zero Dependencies',
    desc: 'Built with React, Next.js, and Tailwind CSS. No external UI kits, no animation libraries.',
    icon: '⬡',
  },
  {
    title: 'Responsive Design',
    desc: 'From ultrawide monitors down to mobile screens, the neon never stops glowing.',
    icon: '◎',
  },
  {
    title: 'Performance First',
    desc: 'GPU-accelerated transforms, will-change hints, and composited layers keep it smooth at 60fps.',
    icon: '⏣',
  },
];

// ─── Marquee text ───
const MARQUEE_TEXT =
  'WELCOME TO THE RETRO FUTURE ★ SYNTHWAVE EXPERIENCE ★ PURE CSS MAGIC ★ NEON DREAMS ★ MARKO.BUSINESS ★ FRONTEND SHOWCASE ★ ';

// ─── Format seconds to m:ss ───
function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Webkit AudioContext typing ───
type AudioContextCtor = typeof AudioContext;
interface WebkitWindow extends Window {
  webkitAudioContext?: AudioContextCtor;
}

const MAX_LOG_LINES = 12;

export default function SynthwavePage() {
  const [stars, setStars] = useState<ReturnType<typeof generateStars>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStars(generateStars(80));
    setMounted(true);
  }, []);

  // Hover glow handler for cards
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const onCardEnter = useCallback((i: number) => setHoveredCard(i), []);
  const onCardLeave = useCallback(() => setHoveredCard(null), []);

  // ─── Audio player state ───
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [progress, setProgress] = useState(0); // seconds into the loop

  // Refs for Web Audio graph
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<Array<AudioScheduledSourceNode | AudioNode>>([]);
  const playStartRef = useRef<number>(0); // audio context time when current loop started
  const rafRef = useRef<number | null>(null);
  const loopTimerRef = useRef<number | null>(null);

  // ─── Terminal log state ───
  const [logs, setLogs] = useState<string[]>([]);
  const logScrollRef = useRef<HTMLDivElement | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => {
      const next = [...prev, `> ${msg}`];
      if (next.length > MAX_LOG_LINES) next.shift();
      return next;
    });
  }, []);

  // Initial boot log on mount
  useEffect(() => {
    addLog('boot sequence complete');
    addLog(`track loaded: ${TRACKS[0].title}`);
  }, [addLog]);

  // Auto-scroll log to bottom when new lines appear
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs]);

  // ─── Lazy AudioContext init ───
  const ensureAudioCtx = useCallback((): AudioContext | null => {
    if (audioCtxRef.current) return audioCtxRef.current;
    if (typeof window === 'undefined') return null;
    const w = window as WebkitWindow;
    const Ctor: AudioContextCtor | undefined = window.AudioContext || w.webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    audioCtxRef.current = ctx;
    masterGainRef.current = master;
    return ctx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop all currently scheduled nodes
  const stopAllNodes = useCallback(() => {
    for (const n of activeNodesRef.current) {
      try {
        if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
          (n as AudioScheduledSourceNode).stop();
        }
        (n as AudioNode).disconnect();
      } catch {
        // ignore
      }
    }
    activeNodesRef.current = [];
    if (loopTimerRef.current !== null) {
      window.clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  }, []);

  // Schedule one loop of a track starting at ctx.currentTime
  const scheduleLoop = useCallback((trackIdx: number) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    const track = TRACKS[trackIdx];
    const startAt = ctx.currentTime + 0.05;

    // Per-track filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = track.filterCutoff;
    filter.Q.value = 6;
    filter.connect(master);
    activeNodesRef.current.push(filter);

    // Slight chorus-ish delay for lushness
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.18;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.18;
    delay.connect(delayGain).connect(filter);
    activeNodesRef.current.push(delay, delayGain);

    const beatSec = 60 / track.bpm / 2; // 8th notes
    const stepsPerBar = track.pattern.length;
    const barSec = beatSec * stepsPerBar;
    const totalBars = Math.max(1, Math.round(track.lengthSec / barSec));

    for (let bar = 0; bar < totalBars; bar++) {
      for (let i = 0; i < stepsPerBar; i++) {
        const tStart = startAt + bar * barSec + i * beatSec;
        const tEnd = tStart + beatSec * 0.9;

        // Lead note
        const leadIdx = track.pattern[i];
        const leadSemi = track.scale[leadIdx % track.scale.length];
        const leadFreq = track.rootFreq * st(leadSemi) * 2; // up an octave

        const leadOsc = ctx.createOscillator();
        leadOsc.type = track.leadType;
        leadOsc.frequency.setValueAtTime(leadFreq, tStart);
        leadOsc.detune.value = track.detune;
        const leadGain = ctx.createGain();
        leadGain.gain.setValueAtTime(0, tStart);
        leadGain.gain.linearRampToValueAtTime(0.25, tStart + 0.015);
        leadGain.gain.linearRampToValueAtTime(0.0001, tEnd);
        leadOsc.connect(leadGain).connect(filter);
        leadGain.connect(delay);
        leadOsc.start(tStart);
        leadOsc.stop(tEnd + 0.02);
        activeNodesRef.current.push(leadOsc, leadGain);

        // Bass note
        const bassIdx = track.bassPattern[i % track.bassPattern.length];
        const bassSemi = track.scale[bassIdx % track.scale.length];
        const bassFreq = (track.rootFreq * st(bassSemi)) / 2; // down an octave

        const bassOsc = ctx.createOscillator();
        bassOsc.type = track.bassType;
        bassOsc.frequency.setValueAtTime(bassFreq, tStart);
        const bassGain = ctx.createGain();
        bassGain.gain.setValueAtTime(0, tStart);
        bassGain.gain.linearRampToValueAtTime(0.35, tStart + 0.01);
        bassGain.gain.linearRampToValueAtTime(0.0001, tStart + beatSec * 0.85);
        bassOsc.connect(bassGain).connect(filter);
        bassOsc.start(tStart);
        bassOsc.stop(tStart + beatSec + 0.02);
        activeNodesRef.current.push(bassOsc, bassGain);
      }
    }

    const totalLen = totalBars * barSec;
    playStartRef.current = startAt;

    // Schedule next loop
    loopTimerRef.current = window.setTimeout(
      () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          scheduleLoop(trackIdx);
        }
      },
      Math.max(100, totalLen * 1000 - 50)
    );
  }, []);

  // Start playback of a track
  const startPlayback = useCallback(
    (trackIdx: number) => {
      const ctx = ensureAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      stopAllNodes();
      scheduleLoop(trackIdx);
    },
    [ensureAudioCtx, stopAllNodes, scheduleLoop]
  );

  // RAF progress updater
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    const tick = () => {
      const ctx = audioCtxRef.current;
      if (ctx) {
        const elapsed = ctx.currentTime - playStartRef.current;
        const len = TRACKS[currentTrack].lengthSec;
        setProgress(((elapsed % len) + len) % len);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, currentTrack]);

  // Handlers
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopAllNodes();
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'running') {
        void ctx.suspend();
      }
      setIsPlaying(false);
      addLog('playback paused');
    } else {
      startPlayback(currentTrack);
      setIsPlaying(true);
      addLog('playback started');
    }
  }, [isPlaying, currentTrack, startPlayback, stopAllNodes, addLog]);

  const selectTrack = useCallback(
    (idx: number) => {
      setCurrentTrack(idx);
      setProgress(0);
      addLog(`track loaded: ${TRACKS[idx].title}`);
      if (isPlaying) {
        startPlayback(idx);
      }
    },
    [isPlaying, startPlayback, addLog]
  );

  const handleNext = useCallback(() => {
    const next = (currentTrack + 1) % TRACKS.length;
    addLog('next track');
    selectTrack(next);
  }, [currentTrack, selectTrack, addLog]);

  const handlePrev = useCallback(() => {
    const prev = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
    addLog('prev track');
    selectTrack(prev);
  }, [currentTrack, selectTrack, addLog]);

  const handleVolume = useCallback(
    (v: number) => {
      setVolume(v);
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(v, audioCtxRef.current.currentTime);
      }
      addLog(`volume set to ${Math.round(v * 100)}%`);
    },
    [addLog]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllNodes();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const ctx = audioCtxRef.current;
      if (ctx) {
        void ctx.close().catch(() => {});
      }
      audioCtxRef.current = null;
      masterGainRef.current = null;
    };
  }, [stopAllNodes]);

  const track = TRACKS[currentTrack];
  const progressPct = (progress / track.lengthSec) * 100;

  return (
    <>
      {/* ── Global keyframe animations ── */}
      <style>{`
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.15); }
          50% { transform: scaleY(1); }
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
        @keyframes flickerGlow {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.7; }
          94% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
        }
        @keyframes heroFadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tapeSpinA {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes tapeSpinB {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes horizonGlow {
          0%, 100% { box-shadow: 0 0 40px 8px rgba(232,121,249,0.3), 0 0 80px 20px rgba(168,85,247,0.15); }
          50% { box-shadow: 0 0 60px 12px rgba(232,121,249,0.5), 0 0 120px 30px rgba(168,85,247,0.25); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes chromePulse {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes cursorBlink {
          0%, 49% { border-right-color: #22d3ee; }
          50%, 100% { border-right-color: transparent; }
        }

        .synthwave-page ::-webkit-scrollbar { width: 6px; }
        .synthwave-page ::-webkit-scrollbar-track { background: #0a0a0a; }
        .synthwave-page ::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 3px; }

        .sw-volume { -webkit-appearance: none; appearance: none; background: transparent; }
        .sw-volume::-webkit-slider-runnable-track {
          height: 4px;
          background: linear-gradient(90deg, #a855f7, #e879f9);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(232,121,249,0.5);
        }
        .sw-volume::-moz-range-track {
          height: 4px;
          background: linear-gradient(90deg, #a855f7, #e879f9);
          border-radius: 2px;
        }
        .sw-volume::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #22d3ee;
          margin-top: -5px;
          box-shadow: 0 0 10px rgba(34,211,238,0.8);
          cursor: pointer;
        }
        .sw-volume::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #22d3ee;
          border: none;
          box-shadow: 0 0 10px rgba(34,211,238,0.8);
          cursor: pointer;
        }
      `}</style>

      <div
        className="synthwave-page relative min-h-screen overflow-x-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0d001a 40%, #1a0028 70%, #0a0a0a 100%)',
          fontFamily: '"Courier New", Courier, monospace',
          color: '#e2e8f0',
        }}
      >
        {/* ════════════════════════════════════════════════════
            SECTION 1 — HERO: Sun + Grid + Stars + Title
        ════════════════════════════════════════════════════ */}
        <section
          className="relative w-full overflow-hidden"
          style={{ height: 'max(100vh, 700px)' }}
        >
          {/* ── Stars ── */}
          {mounted &&
            stars.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  background: i % 3 === 0 ? '#e879f9' : i % 3 === 1 ? '#22d3ee' : '#fff',
                  animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                  boxShadow:
                    i % 3 === 0
                      ? '0 0 4px 1px rgba(232,121,249,0.6)'
                      : i % 3 === 1
                        ? '0 0 4px 1px rgba(34,211,238,0.6)'
                        : '0 0 3px 1px rgba(255,255,255,0.4)',
                }}
              />
            ))}

          {/* ── Sun ── */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: '28%',
              transform: 'translateX(-50%)',
              width: 'min(55vw, 380px)',
              height: 'min(27.5vw, 190px)',
              overflow: 'hidden',
              animation: 'sunPulse 6s ease-in-out infinite',
            }}
          >
            {/* Full circle, clipped to top half */}
            <div
              className="absolute w-full"
              style={{
                height: '200%',
                top: 0,
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse at 50% 100%, #fb923c 0%, #e879f9 40%, #a855f7 70%, transparent 100%)',
                boxShadow:
                  '0 0 80px 30px rgba(232,121,249,0.35), 0 0 160px 60px rgba(251,146,60,0.15)',
              }}
            />
            {/* Scan lines over the sun */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 4px, #0a0a0a 4px, #0a0a0a 9px)',
              }}
            />
          </div>

          {/* ── Horizon line ── */}
          <div
            className="absolute left-0 w-full"
            style={{
              bottom: '28%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #e879f9 20%, #fb923c 50%, #e879f9 80%, transparent 100%)',
              animation: 'horizonGlow 4s ease-in-out infinite',
            }}
          />

          {/* ── Perspective Grid Floor ── */}
          <div
            className="absolute left-0 w-full overflow-hidden"
            style={{
              bottom: 0,
              height: '28%',
              perspective: '400px',
            }}
          >
            <div
              className="absolute w-full"
              style={{
                top: 0,
                left: '-10%',
                width: '120%',
                height: '200%',
                transformOrigin: 'top center',
                transform: 'rotateX(55deg)',
                backgroundImage: `
                  linear-gradient(0deg, rgba(168,85,247,0.35) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(168,85,247,0.35) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: 'gridScroll 2s linear infinite',
              }}
            />
            {/* Fade overlay so grid fades at edges */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(0deg, #0a0a0a 0%, transparent 40%), linear-gradient(90deg, #0a0a0a 0%, transparent 15%, transparent 85%, #0a0a0a 100%)',
              }}
            />
          </div>

          {/* ── Title text ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4"
            style={{
              animation: 'heroFadeIn 1.5s ease-out forwards',
              paddingBottom: '12vh',
            }}
          >
            <h1
              className="font-bold text-center tracking-widest uppercase select-none"
              style={{
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                lineHeight: 1,
                letterSpacing: '0.15em',
                color: 'transparent',
                background:
                  'linear-gradient(180deg, #fb923c 0%, #e879f9 50%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow:
                  '0 0 40px rgba(232,121,249,0.6), 0 0 80px rgba(168,85,247,0.4), 0 0 120px rgba(251,146,60,0.2)',
                animation: 'flickerGlow 8s ease-in-out infinite',
              }}
            >
              SYNTHWAVE
            </h1>
            <p
              className="mt-4 text-center tracking-[0.35em] uppercase"
              style={{
                fontSize: 'clamp(0.65rem, 2vw, 1rem)',
                color: '#22d3ee',
                textShadow: '0 0 15px rgba(34,211,238,0.7), 0 0 30px rgba(34,211,238,0.3)',
              }}
            >
              A Retro Neon Experience
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 2 — CRT SCREEN with Audio Visualizer
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-16 md:py-24 px-4 flex flex-col items-center">
          <SectionLabel text="NOW PLAYING" />

          {/* CRT Container */}
          <div
            className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #111118 0%, #0a0a10 100%)',
              border: '2px solid rgba(168,85,247,0.25)',
              boxShadow:
                '0 0 30px rgba(168,85,247,0.15), inset 0 0 60px rgba(0,0,0,0.5)',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
            }}
          >
            {/* CRT scan lines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
                animation: 'scanlineMove 0.3s linear infinite',
              }}
            />
            {/* CRT vignette */}
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
              }}
            />

            {/* Inner content */}
            <div className="relative z-10">
              <p
                className="text-center text-xs md:text-sm tracking-[0.4em] uppercase mb-8"
                style={{
                  color: '#e879f9',
                  textShadow: '0 0 10px rgba(232,121,249,0.5)',
                }}
              >
                {isPlaying ? '▶' : '❚❚'} {track.title} — Side {track.num[0]}
              </p>

              {/* Audio Visualizer */}
              <div className="flex items-end justify-center gap-[3px] md:gap-1 h-32 md:h-44 mb-8">
                {Array.from({ length: 40 }).map((_, i) => {
                  // Deterministic height in the 15–95% range (no Math.random — SSR-safe)
                  const raw = 50 + Math.sin(i * 0.7) * 25 + Math.cos(i * 1.3) * 20;
                  const h = Math.max(15, Math.min(95, raw));
                  const hue = (i / 40) * 60;
                  return (
                    <div
                      key={i}
                      className="rounded-t-sm"
                      style={{
                        width: 'clamp(3px, 1.5vw, 10px)',
                        height: `${h}%`,
                        background: `linear-gradient(to top, hsl(${280 + hue}, 80%, 60%), hsl(${300 + hue}, 90%, 70%))`,
                        boxShadow: `0 0 6px hsl(${280 + hue}, 80%, 60%), 0 -4px 12px hsl(${280 + hue}, 80%, 50%)`,
                        animation: isPlaying
                          ? `barBounce ${0.6 + (i % 7) * 0.15}s ease-in-out ${(i % 5) * 0.1}s infinite`
                          : 'none',
                        transformOrigin: 'bottom',
                        opacity: isPlaying ? 1 : 0.35,
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress bar */}
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(168,85,247,0.15)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #a855f7, #e879f9)',
                    boxShadow: '0 0 8px rgba(232,121,249,0.5)',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
              <div
                className="flex justify-between mt-2 text-xs"
                style={{ color: 'rgba(232,121,249,0.5)' }}
              >
                <span>{fmtTime(progress)}</span>
                <span>{fmtTime(track.lengthSec)}</span>
              </div>

              {/* Transport controls */}
              <div className="mt-6 flex items-center justify-center gap-4 md:gap-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous track"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    border: '1px solid rgba(168,85,247,0.4)',
                    background: 'rgba(168,85,247,0.08)',
                    color: '#e879f9',
                    textShadow: '0 0 8px rgba(232,121,249,0.6)',
                    boxShadow: '0 0 15px rgba(168,85,247,0.15)',
                  }}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all text-xl"
                  style={{
                    border: '2px solid #e879f9',
                    background: 'linear-gradient(145deg, rgba(232,121,249,0.2), rgba(168,85,247,0.15))',
                    color: '#fff',
                    textShadow: '0 0 12px rgba(232,121,249,0.9)',
                    boxShadow: '0 0 25px rgba(232,121,249,0.5), inset 0 0 15px rgba(232,121,249,0.2)',
                  }}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next track"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    border: '1px solid rgba(168,85,247,0.4)',
                    background: 'rgba(168,85,247,0.08)',
                    color: '#e879f9',
                    textShadow: '0 0 8px rgba(232,121,249,0.6)',
                    boxShadow: '0 0 15px rgba(168,85,247,0.15)',
                  }}
                >
                  ⏭
                </button>
              </div>

              {/* Volume slider */}
              <div className="mt-6 flex items-center gap-3 max-w-xs mx-auto">
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ color: '#22d3ee', textShadow: '0 0 8px rgba(34,211,238,0.5)' }}
                >
                  VOL
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  className="sw-volume flex-1"
                  aria-label="Volume"
                />
                <span
                  className="text-xs w-8 text-right"
                  style={{ color: 'rgba(34,211,238,0.7)' }}
                >
                  {Math.round(volume * 100)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 3 — MIXTAPE / CASSETTE TRACK LISTING
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-16 md:py-24 px-4">
          <SectionLabel text="MIXTAPE" />

          <div className="max-w-2xl mx-auto">
            {/* Cassette body */}
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #1a1a2e 0%, #12121c 100%)',
                border: '2px solid rgba(168,85,247,0.2)',
                boxShadow: '0 0 40px rgba(168,85,247,0.1)',
              }}
            >
              {/* Cassette top label area */}
              <div
                className="relative px-4 py-5 md:px-8 md:py-6 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(232,121,249,0.04) 100%)',
                  borderBottom: '1px solid rgba(168,85,247,0.15)',
                }}
              >
                {/* Tape reel left - spins only when playing */}
                <div
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: 'rgba(168,85,247,0.4)',
                    animation: isPlaying ? 'tapeSpinA 4s linear infinite' : 'none',
                  }}
                >
                  <div
                    className="w-4 h-4 md:w-6 md:h-6 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}
                  />
                </div>

                <div className="text-center flex-1 mx-4">
                  <p
                    className="text-xs md:text-sm tracking-[0.3em] uppercase"
                    style={{
                      color: '#e879f9',
                      textShadow: '0 0 10px rgba(232,121,249,0.5)',
                    }}
                  >
                    Neon Nights Vol. I
                  </p>
                  <p className="text-[10px] md:text-xs tracking-widest mt-1" style={{ color: 'rgba(232,121,249,0.35)' }}>
                    C-90 ★ CHROME TYPE II
                  </p>
                </div>

                {/* Tape reel right - spins only when playing */}
                <div
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: 'rgba(168,85,247,0.4)',
                    animation: isPlaying ? 'tapeSpinB 3s linear infinite' : 'none',
                  }}
                >
                  <div
                    className="w-4 h-4 md:w-6 md:h-6 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}
                  />
                </div>
              </div>

              {/* Track listing */}
              <div className="divide-y" style={{ borderColor: 'rgba(168,85,247,0.08)' }}>
                {TRACKS.map((t, i) => {
                  const isActive = i === currentTrack;
                  return (
                    <button
                      type="button"
                      key={t.num}
                      onClick={() => selectTrack(i)}
                      className="w-full text-left flex items-center px-4 py-3 md:px-8 md:py-4 transition-colors duration-300 group cursor-pointer"
                      style={{
                        borderBottom: i < TRACKS.length - 1 ? '1px solid rgba(168,85,247,0.06)' : 'none',
                        background: isActive ? 'rgba(232,121,249,0.1)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }
                      }}
                    >
                      <span
                        className="text-xs md:text-sm font-bold w-8 md:w-10 flex-shrink-0"
                        style={{
                          color: isActive ? '#e879f9' : '#fb923c',
                          textShadow: isActive
                            ? '0 0 10px rgba(232,121,249,0.8)'
                            : '0 0 8px rgba(251,146,60,0.4)',
                        }}
                      >
                        {isActive && isPlaying ? '▶' : t.num}
                      </span>
                      <span
                        className="flex-1 text-sm md:text-base tracking-wide"
                        style={{
                          color: isActive ? '#fff' : '#e2e8f0',
                          textShadow: isActive ? '0 0 10px rgba(232,121,249,0.6)' : 'none',
                        }}
                      >
                        {t.title}
                      </span>
                      <span
                        className="text-xs md:text-sm flex-shrink-0"
                        style={{ color: 'rgba(34,211,238,0.5)' }}
                      >
                        {t.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 4 — FEATURES / NEON CARDS
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-16 md:py-24 px-4">
          <SectionLabel text="SPECS" />

          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {FEATURES.map((f, i) => {
              const isHovered = hoveredCard === i;
              const accentColors = ['#e879f9', '#22d3ee', '#fb923c', '#a855f7'];
              const accent = accentColors[i % accentColors.length];
              return (
                <div
                  key={f.title}
                  className="relative rounded-xl p-6 md:p-8 transition-all duration-500 cursor-default"
                  style={{
                    background: 'linear-gradient(145deg, rgba(26,26,46,0.8) 0%, rgba(10,10,15,0.9) 100%)',
                    border: `1px solid ${isHovered ? accent : 'rgba(168,85,247,0.15)'}`,
                    boxShadow: isHovered
                      ? `0 0 30px ${accent}44, 0 0 60px ${accent}22, inset 0 0 30px ${accent}08`
                      : '0 0 15px rgba(168,85,247,0.05)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    animation: `floatUp ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                  }}
                  onMouseEnter={() => onCardEnter(i)}
                  onMouseLeave={onCardLeave}
                >
                  <div
                    className="text-3xl md:text-4xl mb-4"
                    style={{
                      color: accent,
                      textShadow: `0 0 15px ${accent}88`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="text-lg md:text-xl font-bold tracking-wide uppercase mb-2"
                    style={{
                      color: accent,
                      textShadow: `0 0 10px ${accent}55`,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(226,232,240,0.6)' }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 5 — CHROME / METALLIC TEXT SHOWCASE
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-16 md:py-24 px-4 text-center">
          <h2
            className="font-bold uppercase tracking-[0.2em] select-none"
            style={{
              fontSize: 'clamp(2rem, 7vw, 5rem)',
              lineHeight: 1.1,
              background:
                'linear-gradient(90deg, #94a3b8 0%, #e2e8f0 20%, #f8fafc 40%, #cbd5e1 60%, #94a3b8 80%, #e2e8f0 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'chromePulse 4s linear infinite',
              textShadow: 'none',
            }}
          >
            Chrome Dreams
          </h2>
          <p
            className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase"
            style={{
              color: '#fb923c',
              textShadow: '0 0 12px rgba(251,146,60,0.5)',
            }}
          >
            Metallic text effects, zero images
          </p>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 6 — SCROLLING MARQUEE
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-8 overflow-hidden">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: 'marqueeScroll 20s linear infinite' }}
          >
            {/* Double the text so it loops seamlessly */}
            {[0, 1].map((k) => (
              <span
                key={k}
                className="inline-block text-sm md:text-lg tracking-[0.3em] uppercase font-bold px-2"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(168,85,247,0.4)',
                  textShadow: '0 0 20px rgba(168,85,247,0.15)',
                }}
              >
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 7 — LIVE ACTION LOG TERMINAL
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-16 md:py-24 px-4 flex flex-col items-center">
          <SectionLabel text="TERMINAL" />

          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #08080f 0%, #0d0d18 100%)',
              border: '2px solid rgba(34,211,238,0.2)',
              boxShadow: '0 0 40px rgba(34,211,238,0.08), inset 0 0 60px rgba(0,0,0,0.5)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            }}
          >
            {/* CRT scan lines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
              }}
            />
            {/* Terminal content */}
            <div className="relative z-10 text-xs md:text-sm leading-relaxed" style={{ color: '#22d3ee' }}>
              <p style={{ color: '#fb923c' }}>SYNTHWAVE OS v8.6 — Neural Interface</p>
              <div
                ref={logScrollRef}
                className="mt-3"
                style={{
                  height: '14rem',
                  overflowY: 'auto',
                  paddingRight: 8,
                }}
              >
                {logs.map((line, idx) => {
                  const isLatest = idx === logs.length - 1;
                  const color = idx % 2 === 0 ? '#22d3ee' : '#e879f9';
                  return (
                    <p
                      key={`${idx}-${line}`}
                      className="mt-1"
                      style={{
                        color,
                        textShadow: isLatest ? `0 0 10px ${color}99` : `0 0 4px ${color}55`,
                        opacity: isLatest ? 1 : 0.5 + (idx / logs.length) * 0.5,
                      }}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
              <p className="mt-3">
                <span style={{ color: '#22d3ee' }}>{'>'}</span>{' '}
                <span
                  className="inline-block"
                  style={{
                    borderRight: '2px solid #22d3ee',
                    paddingRight: 2,
                    animation: 'cursorBlink 1.1s step-end infinite',
                  }}
                >
                  {'\u00a0'}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SECTION 8 — SECOND MARQUEE (opposite direction feel)
        ════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-6 overflow-hidden">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: 'marqueeScroll 25s linear infinite reverse' }}
          >
            {[0, 1].map((k) => (
              <span
                key={k}
                className="inline-block text-xs md:text-sm tracking-[0.5em] uppercase px-2"
                style={{
                  color: 'rgba(251,146,60,0.2)',
                  textShadow: '0 0 12px rgba(251,146,60,0.1)',
                }}
              >
                {'NEON ◆ CHROME ◆ RETRO ◆ FUTURE ◆ LASER ◆ GRID ◆ PULSE ◆ DRIVE ◆ '}
              </span>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════ */}
        <footer className="relative z-10 py-12 md:py-16 text-center px-4">
          {/* Divider */}
          <div
            className="w-48 md:w-64 h-px mx-auto mb-8"
            style={{
              background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
              boxShadow: '0 0 15px rgba(168,85,247,0.3)',
            }}
          />
          <p
            className="text-xs md:text-sm tracking-[0.3em] uppercase"
            style={{
              color: 'rgba(232,121,249,0.5)',
              textShadow: '0 0 10px rgba(232,121,249,0.2)',
            }}
          >
            A frontend showcase by Marko Krajcheski
          </p>
          <p
            className="mt-3 text-xs tracking-[0.2em] uppercase"
            style={{ color: 'rgba(168,85,247,0.3)' }}
          >
            Built with Next.js + Tailwind CSS + Pure CSS Animations
          </p>
        </footer>

        {/* ── Global scan-line overlay for entire page ── */}
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px)',
          }}
        />
      </div>
    </>
  );
}

// ─── Reusable section label component ───
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="text-center mb-10 md:mb-14">
      <p
        className="text-xs md:text-sm tracking-[0.5em] uppercase font-bold"
        style={{
          color: '#22d3ee',
          textShadow: '0 0 12px rgba(34,211,238,0.5), 0 0 25px rgba(34,211,238,0.2)',
        }}
      >
        {'// '}
        {text}
      </p>
      <div
        className="w-20 h-px mx-auto mt-3"
        style={{
          background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
          boxShadow: '0 0 10px rgba(34,211,238,0.3)',
        }}
      />
    </div>
  );
}
