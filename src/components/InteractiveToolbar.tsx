import React, { useState, memo } from 'react';
import { Sparkles, Camera, Flame, Wand2 } from 'lucide-react';
import { FireworkType } from './FireworksCanvas';
import { soundManager } from '../audio/soundManager';

interface InteractiveToolbarProps {
  onGrandFinale: () => void;
  onLightDiya: () => void;
  cameraMode: 'courtyard' | 'sky' | 'cinematic';
  onChangeCameraMode: (mode: 'courtyard' | 'sky' | 'cinematic') => void;
  currentFireworkType: FireworkType;
  onChangeFireworkType: (type: FireworkType) => void;
}

export const InteractiveToolbar: React.FC<InteractiveToolbarProps> = memo(({
  onGrandFinale,
  onLightDiya,
  cameraMode,
  onChangeCameraMode,
  currentFireworkType,
  onChangeFireworkType,
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const fireworkTypes: { id: FireworkType; label: string; icon: string }[] = [
    { id: 'chrysanthemum', label: 'Gold Chrysanthemum', icon: '🌼' },
    { id: 'multi-layer', label: 'Multi-Layered Burst', icon: '✨' },
    { id: 'willow-gold', label: 'Weeping Willow Gold', icon: '🌟' },
    { id: 'crackling', label: 'Crackling Strobe', icon: '⚡' },
    { id: 'spherical', label: 'Jeweled Sphere', icon: '🔮' },
    { id: 'ring', label: 'Planetary Ring', icon: '🪐' },
  ];

  const cycleCamera = () => {
    soundManager.playDiyaChime();
    if (cameraMode === 'courtyard') onChangeCameraMode('sky');
    else if (cameraMode === 'sky') onChangeCameraMode('cinematic');
    else onChangeCameraMode('courtyard');
  };

  const getCameraLabel = () => {
    switch (cameraMode) {
      case 'courtyard':
        return 'Courtyard View';
      case 'sky':
        return 'Sky Fireworks';
      case 'cinematic':
        return 'Cinematic 360';
    }
  };

  return (
    <nav
      className="absolute bottom-3 sm:bottom-4 inset-x-0 z-30 flex flex-col items-center pointer-events-none select-none px-3"
      aria-label="Diwali Celebration Controls"
    >
      {/* Floating Type Dropdown Menu */}
      {showTypeMenu && (
        <div className="mb-2 sm:mb-3 p-2 rounded-2xl bg-black/90 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-wrap gap-1.5 max-w-sm sm:max-w-md justify-center pointer-events-auto animate-fade-in">
          {fireworkTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onChangeFireworkType(t.id);
                setShowTypeMenu(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentFireworkType === t.id
                  ? 'bg-amber-400 text-amber-950 font-semibold shadow-md'
                  : 'bg-white/5 text-amber-200 hover:bg-white/10'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Glassmorphic Dock */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-full bg-black/80 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.85)] pointer-events-auto max-w-full overflow-x-auto">
        {/* Grand Finale / Celebrate Again */}
        <button
          onClick={onGrandFinale}
          className="group relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 text-amber-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          title="Trigger a massive fireworks show"
          aria-label="Celebrate Again with Grand Fireworks Finale"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-900 animate-spin-slow" />
          <span>Celebrate Again 🎆</span>
        </button>

        {/* Light a Diya */}
        <button
          onClick={onLightDiya}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          title="Light up another diya"
          aria-label="Light up another diya"
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-bounce" />
          <span className="hidden sm:inline">Light a Diya</span>
          <span className="sm:hidden">Light</span>
        </button>

        {/* Camera Switcher */}
        <button
          onClick={cycleCamera}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-black/50 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          title="Toggle camera angle"
          aria-label={`Toggle camera angle. Current: ${getCameraLabel()}`}
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="hidden md:inline">{getCameraLabel()}</span>
        </button>

        {/* Firework Type Picker */}
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-full bg-black/50 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          title="Select firework burst style"
          aria-label="Select firework style"
        >
          <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span className="hidden lg:inline">Style</span>
        </button>
      </div>
    </nav>
  );
});

InteractiveToolbar.displayName = 'InteractiveToolbar';
