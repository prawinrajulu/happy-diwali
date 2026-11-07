import React, { memo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

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
      className="absolute top-16 sm:top-20 inset-x-0 z-20 flex flex-col items-center px-4 text-center select-none animate-fade-in-up pointer-events-none max-h-[calc(100vh-170px)] overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Container with auto pointer events for buttons */}
      <div className="flex flex-col items-center max-w-3xl pointer-events-auto">
        {/* Decorative Auspicious Toran / Ribbon */}
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full border border-amber-400/40 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-3">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin-slow" />
          <span className="text-amber-200 tracking-widest text-[11px] sm:text-xs uppercase font-serif">
            {recipientName ? `Auspicious Greetings for ${recipientName} & Family` : 'Shubh Deepavali • Divine Festival'}
          </span>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin-slow" />
        </div>

        {/* 3D Glowing Golden Main Heading */}
        <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_30px_rgba(255,215,0,0.6)] shimmer-gold">
          🪔 HAPPY DIWALI 🪔
        </h1>

        {/* Subtitle */}
        <p className="mt-2.5 sm:mt-3 text-sm sm:text-lg md:text-xl font-medium text-amber-100/90 max-w-2xl px-2 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          May the festival of lights fill your life with endless happiness, prosperity, love, and success.
        </p>

        {/* Poetic Message */}
        <div className="mt-3 sm:mt-4 px-5 sm:px-6 py-2.5 rounded-2xl bg-black/50 border border-amber-500/20 backdrop-blur-sm max-w-xl text-amber-200/90 text-xs sm:text-sm font-light italic leading-relaxed space-y-0.5 drop-shadow">
          <p>✨ Let every diya bring a new hope,</p>
          <p>🎆 Let every firework spread happiness,</p>
          <p>🪔 And let every moment shine with positivity.</p>
        </div>

        {/* Primary NEXT Navigation Button */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2">
          <button
            onClick={onNext}
            className="group relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.65)] hover:shadow-[0_0_40px_rgba(251,191,36,0.95)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-200/50"
            aria-label="Next: View Family Blessings and Share Wish"
          >
            <span>Next: Family Blessings & Wishes</span>
            <ArrowRight className="w-4 h-4 text-amber-900 group-hover:translate-x-1 transition-transform" />
            <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-md group-hover:blur-lg transition-all -z-10" />
          </button>
          <span className="text-[11px] text-amber-300/60 uppercase tracking-widest font-mono">
            Page 1 of 2 • Click Next or use ➔ key
          </span>
        </div>
      </div>
    </div>
  );
});

DiwaliWishHero.displayName = 'DiwaliWishHero';
