'use client';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { BoltIcon, DropletIcon } from './Icons';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            className={`fixed top-4 right-4 lg:top-8 lg:right-8 z-[100] rounded-full font-bold hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden group border-2 ${isScrolled ? 'w-12 h-12 lg:w-auto lg:h-auto lg:px-5 lg:py-2.5 lg:gap-2 transition-all duration-500 ease-in-out delay-500' : 'px-5 py-2.5 gap-2 transition-all duration-500 ease-in-out'
                } ${isDark
                    ? 'bg-gradient-to-b from-[#90e0ef] via-[#00b4d8] to-[#0077b6] text-white border-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.9),_0_6px_20px_rgba(0,180,216,0.5)] text-shadow-sm'
                    : 'bg-zinc-950 text-[#facc15] border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                }`}
            aria-label="Toggle Theme"
        >
            <span className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 flex-shrink-0">
                {isDark ? <DropletIcon className="w-5 h-5 fill-white" /> : <BoltIcon className="w-5 h-5 fill-[#facc15]" />}
            </span>
            <span className={`whitespace-nowrap overflow-hidden ${isScrolled ? 'max-w-0 opacity-0 transition-all duration-400 ease-out lg:max-w-[200px] lg:opacity-100' : 'max-w-[200px] opacity-100 transition-all duration-400 ease-in delay-100'
                }`}>
                {isDark ? 'Illuminate' : 'Go Dark'}
            </span>
        </button>
    );
}
