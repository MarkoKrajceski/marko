import Link from 'next/link';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Full-bleed black base to block any main-site backgrounds/overlays */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-50 bg-black pointer-events-none"
      />

      {/* Back to main site button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-[200] flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-lg"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        marko.business
      </Link>

      <div className="relative z-0">{children}</div>
    </>
  );
}
