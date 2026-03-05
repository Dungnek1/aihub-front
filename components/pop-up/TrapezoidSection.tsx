"use client";
import './popup.css';

export default function TrapezoidSection() {
    return (
        <div
            className="absolute z-10 top-[367px] w-[50%] max-w-[672px] h-[241px]"
            style={{
                top: '367px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '672px',
                height: '241px',
            }}
        >
            {/* SVG Trapezoid Background with Animated Gradient */}
            <svg
                className="absolute drop-shadow-2xl"
                width="672"
                height="241"
                viewBox="0 0 672 241"
                style={{
                    top: 0,
                    left: 0,
                }}
            >
                <defs>
                    {/* Animated Rainbow Gradient */}
                    <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1F2937" stopOpacity="1">
                            <animate attributeName="stop-color" values="#1F2937;#374151;#1F2937" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="#374151" stopOpacity="1">
                            <animate attributeName="stop-color" values="#374151;#4B5563;#374151" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#1F2937" stopOpacity="1">
                            <animate attributeName="stop-color" values="#1F2937;#374151;#1F2937" dur="3s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>

                    {/* Glow Filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d="M 22.44 0 
             L 649.56 0 
             Q 672 0, 672 22.44 
             L 655 218.56 
             Q 652 241, 629.56 241 
             L 42.44 241 
             Q 20 241, 17 218.56 
             L 0 22.44 
             Q 0 0, 22.44 0 
             Z"
                    fill="url(#animatedGradient)"
                    className="drop-shadow-xl"
                />
            </svg>

            {/* Sparkle Wave Effect - Moving from Left to Right */}


            {/* Content with Shimmer Effect */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
                {/* Main Heading with Shimmer */}
                <h2
                    className="text-3xl font-bold text-center mb-2 relative"
                    style={{
                        background: 'linear-gradient(90deg, #ffffff 0%, #67e8f9 50%, #ffffff 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'shimmer 3s linear infinite',
                    }}
                >
                    XÂY DỰNG DỰ ÁN BLOCKCHAIN - CRYPTO
                </h2>

                {/* Subtitle with Fade Animation */}
                <p
                    className="text-sm text-center mb-6"
                    style={{
                        animation: 'fadeInOut 4s ease-in-out infinite',
                    }}
                >
                    Blockchain Development • Smart Contract • Crypto Exchange • DApp
                </p>

                {/* CTA Button with Glow & Pulse */}
                <button
                    className="px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-110 relative overflow-hidden"
                    style={{
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)',
                        animation: 'buttonPulse 2s ease-in-out infinite',
                    }}
                >
                    <span className="relative z-10">Tìm hiểu thêm &gt;</span>
                    {/* Button Shine Effect */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30"
                        style={{
                            animation: 'shine 3s ease-in-out infinite',
                        }}
                    />
                </button>
            </div>
        </div>
    );
}
