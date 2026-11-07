import React, { memo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface DiwaliWishHeroProps {
  visible: boolean;
  recipientName?: string;
  onNext: () => void;
}

export const DiwaliWishHero: React.FC<DiwaliWishHeroProps> = memo(({
  visible,
  recipientName,
  onNext,
}) => {
  if (!visible) return null;

  return (
    <div
      className="absolute top-14 sm:top-18 inset-x-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center select-none animate-fade-in-up pointer-events-none max-h-[calc(100vh-160px)] overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex flex-col items-center max-w-3xl pointer-events-auto py-2 sm:py-4">
        
        {/* Realistic Glowing 3D Diya placed gracefully above the main heading */}
        <div className="relative flex flex-col items-center mb-3 sm:mb-4 group">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -inset-4 sm:-inset-6 bg-radial from-amber-400/25 via-amber-600/10 to-transparent blur-2xl rounded-full pointer-events-none" />

          {/* SVG Sculpted Brass Diya with Flickering Flame */}
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(255,183,3,0.7)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Flame Radial Gradient */}
              <radialGradient id="outerFlame" cx="50%" cy="80%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#FFF275" />
                <stop offset="60%" stopColor="#FF9100" />
                <stop offset="90%" stopColor="#FF3D00" />
                <stop offset="100%" stopColor="#D50000" stopOpacity="0" />
              </radialGradient>

              {/* Flame Core Glow */}
              <radialGradient id="innerFlame" cx="50%" cy="70%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#FFF9C4" />
                <stop offset="100%" stopColor="#FFD54F" stopOpacity="0.1" />
              </radialGradient>

              {/* Metallic Polished Brass Bowl Linear Gradient */}
              <linearGradient id="brassMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="22%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#996515" />
                <stop offset="78%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#5C3D0A" />
              </linearGradient>

              {/* Bowl Inner Shadow Gradient */}
              <linearGradient id="brassInner" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#5C3D0A" />
                <stop offset="100%" stopColor="#2E1F05" />
              </linearGradient>

              {/* Base Pedestal Gradient */}
              <linearGradient id="pedestalGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#7B5614" />
                <stop offset="50%" stopColor="#FFE082" />
                <stop offset="100%" stopColor="#4A340C" />
              </linearGradient>
            </defs>

            {/* Flickering Flame Group */}
            <g className="animate-flame">
              {/* Outer Radiant Flame Teardrop */}
              <path
                d="M50 14 C56 26, 64 36, 62 48 C60 58, 40 58, 38 48 C36 36, 44 26, 50 14 Z"
                fill="url(#outerFlame)"
                opacity="0.95"
              />
              {/* Inner Brilliant Core */}
              <path
                d="M50 24 C53 32, 57 38, 55 46 C54 52, 46 52, 45 46 C43 38, 47 32, 50 24 Z"
                fill="url(#innerFlame)"
              />
            </g>

            {/* Diya Wick Tip */}
            <path
              d="M49 46 Q50 49, 52 52"
              stroke="#261C02"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Traditional Brass Diya Bowl */}
            <path
              d="M20 54 Q50 50, 80 54 C82 66, 70 78, 50 78 C30 78, 18 66, 20 54 Z"
              fill="url(#brassMetallic)"
            />

            {/* Inner Oil Rim Concave */}
            <ellipse
              cx="50"
              cy="54"
              rx="30"
              ry="5.5"
              fill="url(#brassInner)"
            />

            {/* Golden Rim Accent Edge */}
            <path
              d="M20 54 Q50 51, 80 54"
              stroke="#FFF9C4"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Pedestal Footing */}
            <path
              d="M41 78 L37 84 Q50 86, 63 84 L59 78 Z"
              fill="url(#pedestalGrad)"
            />
          </svg>
        </div>

        {/* Auspicious Minimal Header Ribbon */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 rounded-full border border-amber-400/25 bg-black/45 backdrop-blur-md mb-2.5 sm:mb-3">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span className="text-amber-200/90 tracking-[0.2em] text-[10px] sm:text-xs uppercase font-serif">
            {recipientName ? `Divine Greetings for ${recipientName} & Family` : 'Shubh Deepavali • Divine Festival of Lights'}
          </span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>

        {/* Primary Visual Focus: Metallic Gold HAPPY DIWALI */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_30px_rgba(251,191,36,0.5)] shimmer-gold">
          HAPPY DIWALI
        </h1>

        {/* Sanskrit Inscription / Sacred Blessing */}
        <p className="mt-2 text-xs sm:text-sm font-serif tracking-[0.25em] text-amber-300/80 uppercase">
          तमसो मा ज्योतिर्गमय • Lead Us from Darkness into Light
        </p>

        {/* Elegant Supporting Greeting Message */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-amber-100/90 max-w-xl px-2 leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          May the divine radiance of Diwali illuminate your home with boundless prosperity, joyful warmth, good health, and eternal happiness.
        </p>

        {/* Primary NEXT Navigation Button */}
        <div className="mt-5 sm:mt-7 flex flex-col items-center gap-2">
          <button
            onClick={onNext}
            className="group relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:shadow-[0_0_40px_rgba(251,191,36,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-200/50"
            aria-label="Next: View Family Blessings and Share Wish"
          >
            <span>View Family Blessings & Wishes</span>
            <ArrowRight className="w-4 h-4 text-amber-900 group-hover:translate-x-1 transition-transform" />
            <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-md group-hover:blur-lg transition-all -z-10" />
          </button>
          
          <span className="text-[10px] sm:text-[11px] text-amber-300/50 uppercase tracking-[0.2em] font-mono">
            Page 1 of 2 • Click Next or use ➔ key
          </span>
        </div>
      </div>
    </div>
  );
});

DiwaliWishHero.displayName = 'DiwaliWishHero';
