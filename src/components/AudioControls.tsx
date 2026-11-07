import React, { useState, memo } from 'react';
import { Volume2, VolumeX, Info, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface AudioControlsProps {
  diyasLitCount: number;
}

export const AudioControls: React.FC<AudioControlsProps> = memo(({ diyasLitCount }) => {
  const [muted, setMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    soundManager.setMuted(next);
  };

  return (
    <>
      {/* Top Floating Header Controls */}
      <header className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-30 flex items-center justify-between pointer-events-none select-none">
        {/* Left: Diyas Lit Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-black/65 border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-200 text-xs sm:text-sm font-medium">
            <span className="text-sm sm:text-base animate-pulse">🪔</span>
            <span>Diyas:</span>
            <span className="font-bold text-amber-400 font-mono text-sm sm:text-base">
              {diyasLitCount}
            </span>
          </div>
        </div>

        {/* Right: Sound & Info Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={muted ? 'Unmute Festival Music & Fireworks Sound' : 'Mute Sound'}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] rounded-full bg-black/65 border border-amber-500/40 hover:border-amber-400 text-amber-200 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all cursor-pointer hover:bg-amber-950/40"
            title={muted ? 'Unmute Festival Music & Fireworks' : 'Mute Sound'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-amber-400/70" />
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                <div className="flex items-center gap-0.5 h-3" aria-hidden="true">
                  <span className="w-0.5 h-2 bg-amber-400 animate-[bounce_0.8s_ease-in-out_infinite]" />
                  <span className="w-0.5 h-3 bg-amber-300 animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" />
                  <span className="w-0.5 h-1.5 bg-amber-400 animate-[bounce_0.9s_ease-in-out_infinite_0.4s]" />
                </div>
              </>
            )}
            <span className="text-xs font-medium hidden sm:inline">
              {muted ? 'Muted' : 'Sound On'}
            </span>
          </button>

          {/* Info Modal Trigger */}
          <button
            onClick={() => setShowInfo(true)}
            aria-label="Diwali Interactive Experience Guide"
            className="p-2 sm:p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/65 border border-amber-500/40 hover:border-amber-400 text-amber-300 backdrop-blur-md shadow-md hover:bg-amber-950/40 transition-all cursor-pointer"
            title="How to interact"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#090b16] border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-amber-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-amber-400/80 hover:text-amber-200 hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪔</span>
              <h3 className="text-xl font-serif font-bold text-amber-300">
                Diwali Interactive Guide
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-amber-200/90 leading-relaxed font-light">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">✨ Fireworks:</span>
                <span>Tap or click anywhere in the night sky to launch interactive firework rockets!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">🪔 3D Diyas:</span>
                <span>Click or tap any courtyard diya to light it brighter and hear the temple bell chime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">🎆 Grand Finale:</span>
                <span>Click "Celebrate Again" in the bottom dock to trigger an 18+ rocket sky celebration!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">📷 Camera Modes:</span>
                <span>Switch between Courtyard View, Sky Fireworks View, and 360 Cinematic Orbit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">💌 Custom Wishes:</span>
                <span>Enter names to generate personalized links to share Diwali happiness with family!</span>
              </li>
            </ul>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 text-amber-950 font-bold text-sm shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              Back to Celebration ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
});

AudioControls.displayName = 'AudioControls';
