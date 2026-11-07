import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface DiwaliWishHeroProps {
  visible: boolean;
  recipientName?: string;
}

export const DiwaliWishHero: React.FC<DiwaliWishHeroProps> = ({
  visible,
  recipientName,
}) => {
  if (!visible) return null;

  return (
    <div className="absolute top-14 sm:top-20 inset-x-0 z-20 flex flex-col items-center pointer-events-none px-4 text-center select-none animate-fade-in-up">
      {/* Decorative Auspicious Toran / Ribbon */}
      <div className="inline-flex items-center gap-2 px-5 py-1 rounded-full border border-amber-400/40 bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-3">
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
        <span className="text-amber-200 tracking-widest text-xs uppercase font-serif">
          {recipientName ? `Auspicious Greetings for ${recipientName} & Family` : 'Shubh Deepavali • Divine Festival'}
        </span>
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
      </div>

      {/* 3D Glowing Golden Main Heading */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_30px_rgba(255,215,0,0.6)] shimmer-gold">
        🪔 HAPPY DIWALI 🪔
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-sm sm:text-lg md:text-xl font-medium text-amber-100/90 max-w-2xl px-2 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
        May the festival of lights fill your life with endless happiness, prosperity, love, and success.
      </p>

      {/* Poetic Message */}
      <div className="mt-4 px-6 py-2.5 rounded-2xl bg-black/40 border border-amber-500/20 backdrop-blur-sm max-w-xl text-amber-200/90 text-xs sm:text-sm font-light italic leading-relaxed space-y-0.5 drop-shadow">
        <p>✨ Let every diya bring a new hope,</p>
        <p>🎆 Let every firework spread happiness,</p>
        <p>🪔 And let every moment shine with positivity.</p>
      </div>
    </div>
  );
};

