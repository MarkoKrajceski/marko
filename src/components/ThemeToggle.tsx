'use client';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { BoltIcon, DropletIcon } from './Icons';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        const x = e.clientX;
        const y = e.clientY;
        document.documentElement.style.setProperty('--click-x', `${x}px`);
        document.documentElement.style.setProperty('--click-y', `${y}px`);

        const newTheme = theme === 'dark' ? 'light' : 'dark';

        const update = () => {
            // Disable transitions to prevent snapshots from capturing mid-transition states
            const css = document.createElement('style');
            css.appendChild(
                document.createTextNode(
                    `* {
                   -webkit-transition: none !important;
                   -moz-transition: none !important;
                   -o-transition: none !important;
                   -ms-transition: none !important;
                   transition: none !important;
                }`
                )
            );
            document.head.appendChild(css);

            flushSync(() => {
                setTheme(newTheme);
            });
            // Manually update the attribute to ensure the View Transition snapshot is correct
            document.documentElement.setAttribute('data-theme', newTheme);

            // Force a reflow to ensure the style update is applied before snapshot
            void window.getComputedStyle(css).opacity;

            // Remove the disable-transition style in the next frame
            setTimeout(() => {
                document.head.removeChild(css);
            }, 0);
        };

        // Check if View Transition API is supported
        if ('startViewTransition' in document) {
            document.startViewTransition(update);
        } else {
            update();
        }
    };

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`fixed top-4 right-4 lg:top-8 lg:right-8 z-[100] px-5 py-2.5 rounded-full font-bold transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-2 group border-2 ${isDark
                ? 'bg-gradient-to-b from-[#90e0ef] via-[#00b4d8] to-[#0077b6] text-white border-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.9),_0_6px_20px_rgba(0,180,216,0.5)] text-shadow-sm'
                : 'bg-zinc-950 text-[#facc15] border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                }`}
            aria-label="Toggle Theme"
        >
            <span className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                {isDark ? <DropletIcon className="w-5 h-5 fill-white" /> : <BoltIcon className="w-5 h-5 fill-[#facc15]" />}
            </span>
            <span>{isDark ? 'Illuminate' : 'Go Dark'}</span>
        </button>
    );
}
