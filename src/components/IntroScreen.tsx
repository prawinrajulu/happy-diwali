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
      className="absolute inset-0 z-20 flex flex-col items-center justify-between pointer-events-none p-4 sm:p-8 select-none bg-radial from-transparent via-[#020308]/70 to-[#020308]"
      style={{ touchAction: 'none' }}
    >
      {/* Top Header Badge */}
      <div className="pt-6 sm:pt-10 flex flex-col items-center animate-fade-in pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-amber-500/25 bg-black/40 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs tracking-[0.25em] uppercase shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Shubh Deepavali • Festival of Lights</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      </div>

      {/* Center Cinematic Typography */}
      <div className="flex flex-col items-center text-center max-w-2xl px-4 my-auto pointer-events-auto">
        
        {/* Subtle Golden Diya Icon */}
        <div className="relative mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-radial from-amber-400/20 to-transparent blur-md absolute -inset-1" />
          <span className="text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse inline-block">
            🪔
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-wider mb-2 sm:mb-3 shimmer-gold drop-shadow-[0_4px_30px_rgba(255,215,0,0.45)]">
          THE FESTIVAL OF LIGHTS
        </h1>
        
        <div className="h-0.5 w-16 sm:w-24 bg-linear-to-r from-transparent via-amber-400/80 to-transparent my-2 sm:my-3 shadow-[0_0_8px_#F59E0B]" />
        
        <p className="text-amber-100/90 text-sm sm:text-lg md:text-xl font-light italic tracking-wide max-w-lg mb-6 sm:mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          "A little light can make the world beautiful."
        </p>

        {/* Glowing Experience Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full text-base sm:text-lg font-bold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_35px_rgba(251,191,36,0.65)] hover:shadow-[0_0_55px_rgba(251,191,36,0.95)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-amber-200/50 min-h-[48px]"
          aria-label="Experience Diwali 3D Celebration"
        >
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900 animate-flame" />
          <span className="tracking-wide">✨ Experience Diwali</span>
          <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-md group-hover:blur-lg transition-all -z-10" />
        </button>

        <span className="mt-4 text-[10px] sm:text-[11px] tracking-[0.2em] text-amber-300/60 uppercase font-mono">
          Interactive 3D Festival • Sound On Recommended
        </span>
      </div>

      {/* Bottom Spacer */}
      <div className="pb-4" />
    </div>
  );
});

IntroScreen.displayName = 'IntroScreen';
