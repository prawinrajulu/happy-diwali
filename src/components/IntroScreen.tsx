import React, { memo } from 'react';
import { Sparkles, Flame } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
  visible: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = memo(({ onStart, visible }) => {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-between pointer-events-none p-4 sm:p-6 select-none bg-linear-to-b from-black/85 via-transparent to-black/90"
      style={{ touchAction: 'none' }}
    >
      {/* Top Header Badge */}
      <div className="pt-8 sm:pt-10 flex flex-col items-center animate-fade-in pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-amber-500/40 bg-black/50 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Deepavali Utsav 2026</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Center Cinematic Typography */}
      <div className="flex flex-col items-center text-center max-w-2xl px-4 my-auto pointer-events-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-wider mb-2.5 sm:mb-3 shimmer-gold drop-shadow-[0_4px_24px_rgba(255,215,0,0.45)]">
          THE FESTIVAL OF LIGHTS
        </h1>
        <div className="h-0.5 w-20 sm:w-24 bg-linear-to-r from-transparent via-amber-400 to-transparent my-2 sm:my-3 shadow-[0_0_8px_#F59E0B]" />
        <p className="text-amber-100/90 text-sm sm:text-lg md:text-xl font-light italic tracking-wide max-w-lg mb-6 sm:mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          "A little light can make the world beautiful."
        </p>

        {/* Glowing Experience Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_35px_rgba(251,191,36,0.65)] hover:shadow-[0_0_55px_rgba(251,191,36,0.95)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-200/50"
          aria-label="Experience Diwali 3D Celebration"
        >
          <Flame className="w-5 h-5 text-amber-800 animate-bounce" />
          <span className="tracking-wide">✨ Experience Diwali</span>
          <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-md group-hover:blur-lg transition-all -z-10" />
        </button>

        <span className="mt-3.5 text-[11px] sm:text-xs tracking-wider text-amber-400/70 uppercase">
          Tap anywhere in the sky for fireworks • Sound on for best experience
        </span>
      </div>

      {/* Bottom Hint */}
      <div className="pb-4 sm:pb-6 text-center text-[10px] sm:text-xs text-amber-200/40 tracking-wider">
        Crafted with 3D WebGL • Three.js • Spatial Sound
      </div>
    </div>
  );
});

IntroScreen.displayName = 'IntroScreen';
