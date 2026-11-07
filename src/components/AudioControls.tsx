import React, { useState, memo } from 'react';
import { Volume2, VolumeX, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface AudioControlsProps {
  diyasLitCount: number;
  activeTab: 'hero' | 'ending';
  onPrevTab: () => void;
  onNextTab: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = memo(({
  diyasLitCount,
  activeTab,
  onPrevTab,
  onNextTab,
  isMuted,
  onToggleSound,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {/* Sleek Minimal Top Navigation Header */}
      <header
        className="absolute top-2.5 sm:top-4 inset-x-3 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none select-none"
        aria-label="Diwali Celebration Top Navigation"
      >
        {/* Left: Minimized, subtle diya counter */}
        <div className="flex items-center pointer-events-auto">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-amber-500/20 backdrop-blur-md text-amber-200/70 text-[11px] font-mono tracking-wider shadow-sm hover:border-amber-400/40 transition-colors"
            title="Diyas illuminated in the courtyard"
          >
            <span className="text-xs">🪔</span>
            <span className="font-semibold text-amber-300">{diyasLitCount}</span>
          </div>
        </div>

        {/* Center: Minimal Elegant Page Indicators with Previous & Next */}
        <nav
          aria-label="Celebration Steps Navigation"
          className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-amber-500/25 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.6)] pointer-events-auto"
        >
          {/* Previous Button */}
          <button
            onClick={onPrevTab}
            disabled={activeTab === 'hero'}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'hero'
                ? 'text-amber-500/25 cursor-not-allowed opacity-40'
                : 'text-amber-300 hover:bg-white/10 hover:text-amber-100 active:scale-95'
            }`}
            title="Previous Step"
            aria-label="Previous Page: Celebration"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Page 1 Indicator */}
          <button
            onClick={onPrevTab}
            className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-serif tracking-widest uppercase transition-all cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-linear-to-r from-amber-400 to-amber-500 text-amber-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'text-amber-200/60 hover:text-amber-100 hover:bg-white/5'
            }`}
            aria-current={activeTab === 'hero' ? 'page' : undefined}
          >
            01 • Celebration
          </button>

          {/* Page 2 Indicator */}
          <button
            onClick={onNextTab}
            className={`px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-serif tracking-widest uppercase transition-all cursor-pointer ${
              activeTab === 'ending'
                ? 'bg-linear-to-r from-amber-400 to-amber-500 text-amber-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'text-amber-200/60 hover:text-amber-100 hover:bg-white/5'
            }`}
            aria-current={activeTab === 'ending' ? 'page' : undefined}
          >
            02 • Blessings
          </button>

          {/* Next Button */}
          <button
            onClick={onNextTab}
            disabled={activeTab === 'ending'}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'ending'
                ? 'text-amber-500/25 cursor-not-allowed opacity-40'
                : 'text-amber-300 hover:bg-white/10 hover:text-amber-100 active:scale-95'
            }`}
            title="Next Step"
            aria-label="Next Page: Blessings & Wishes"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </nav>

        {/* Right: Sound toggle and Info guide */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute Festival Music' : 'Mute Music'}
            className="p-2 sm:p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 backdrop-blur-md transition-all cursor-pointer hover:bg-white/10"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-amber-400/60" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Info Modal Trigger */}
          <button
            onClick={() => setShowInfo(true)}
            aria-label="Diwali Interactive Experience Guide"
            className="p-2 sm:p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/40 border border-amber-500/20 hover:border-amber-400 text-amber-300 backdrop-blur-md transition-all cursor-pointer hover:bg-white/10"
            title="Interactive Guide"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Luxury Interactive Guide Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#080a14] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-amber-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-amber-400/70 hover:text-amber-200 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🪔</span>
              <h3 className="text-xl font-serif font-bold text-amber-300">
                Diwali Interactive Guide
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-amber-200/90 leading-relaxed font-light">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">✨ Fireworks:</span>
                <span>Click or tap anywhere in the night sky to launch interactive colorful rockets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">🪔 3D Courtyard Diya:</span>
                <span>Click the glowing courtyard diya to light it brighter and hear temple chimes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">🎆 Grand Finale:</span>
                <span>Use the bottom toolbar to trigger a synchronized grand fireworks show.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">📷 Camera Angles:</span>
                <span>Switch between Courtyard View, Sky Fireworks, and 360 Cinematic Orbit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">💌 Custom Blessings:</span>
                <span>Navigate to Page 2 to personalize and share your festive wishes with family!</span>
              </li>
            </ul>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-3 rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 text-amber-950 font-bold text-xs sm:text-sm shadow-lg hover:brightness-105 active:scale-98 transition-all cursor-pointer"
            >
              Return to Celebration ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
});

AudioControls.displayName = 'AudioControls';
