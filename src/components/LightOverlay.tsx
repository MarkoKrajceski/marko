'use client';

import { useEffect, useState } from 'react';

export default function LightOverlay() {
    const [bubbles, setBubbles] = useState<{ id: number; size: number; left: number; delay: number; duration: number }[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Reduce bubbles on mobile
        const bubbleCount = window.innerWidth < 768 ? 8 : 25;
        const newBubbles = Array.from({ length: bubbleCount }).map((_, i) => ({
            id: i,
            size: Math.random() * 40 + 20, // 20px to 60px
            left: Math.random() * 100, // 0 to 100%
            delay: Math.random() * 20, // 0 to 20s
            duration: Math.random() * 10 + 10, // 10s to 20s
        }));
        setBubbles(newBubbles);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="light-overlay opacity-50 relative z-[-1]" aria-hidden="true">
            {/* Top Light Rays/Aurora - Reduced blur on mobile */}
            <div className={`absolute top-0 left-[-20%] right-[-20%] h-[60vh] bg-gradient-to-b from-white/40 via-[#90e0ef]/20 to-transparent ${isMobile ? 'blur-xl' : 'blur-3xl'} mix-blend-screen animate-pulse-slow`} />
            <div className={`absolute top-[-10%] left-[10%] w-[80%] h-[40vh] bg-gradient-to-br from-[#caf0f8]/30 to-transparent ${isMobile ? 'blur-xl' : 'blur-3xl'} transform -rotate-12 ${isMobile ? '' : 'animate-float'}`} />

            {/* Premium Glow Blobs - Reduced blur and disabled animations on mobile */}
            <div className={`absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#90e0ef]/30 to-transparent ${isMobile ? 'blur-[60px]' : 'blur-[120px]'} ${isMobile ? '' : 'animate-pulse-slow'}`} />
            <div className={`absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#00b4d8]/10 to-transparent ${isMobile ? 'blur-[60px]' : 'blur-[150px]'} ${isMobile ? '' : 'animate-pulse-slow animation-delay-1000'}`} />
            <div className={`absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vh] bg-[#caf0f8]/10 ${isMobile ? 'blur-[50px]' : 'blur-[100px]'} rounded-full transform rotate-45`} />

            {/* Dynamic Glass Reflection - Reduced blur on mobile */}
            <div className={`absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-white/40 to-transparent ${isMobile ? 'blur-[40px]' : 'blur-[80px]'} pointer-events-none transform rotate-45 ${isMobile ? '' : 'animate-pulse-slow'}`} />

            {/* Bubbles - Fewer on mobile */}
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className="light-bubble"
                    style={{
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        left: `${bubble.left}%`,
                        animationDelay: `${bubble.delay}s`,
                        animationDuration: `${bubble.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}
