import React, { useState, memo } from 'react';
import { Sparkles, Camera, Flame, Volume2, VolumeX, Wand2 } from 'lucide-react';
import { FireworkType } from './FireworksCanvas';
import { soundManager } from '../audio/soundManager';

interface InteractiveToolbarProps {
  onLightDiya: () => void;
  onLaunchFirework: () => void;
  onGrandFinale: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  cameraMode: 'courtyard' | 'sky' | 'cinematic';
  onChangeCameraMode: (mode: 'courtyard' | 'sky' | 'cinematic') => void;
  currentFireworkType: FireworkType;
  onChangeFireworkType: (type: FireworkType) => void;
}

export const InteractiveToolbar: React.FC<InteractiveToolbarProps> = memo(({
  onLightDiya,
  onLaunchFirework,
  onGrandFinale,
  isMuted,
  onToggleSound,
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
        return 'Courtyard';
      case 'sky':
        return 'Sky View';
      case 'cinematic':
        return '360 Orbit';
    }
  };

  return (
    <nav
      className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-30 flex flex-col items-center pointer-events-none select-none px-3"
      aria-label="Diwali Celebration Controls"
    >
      {/* Floating Firework Type Menu */}
      {showTypeMenu && (
        <div className="mb-2 p-1.5 sm:p-2 rounded-2xl bg-black/85 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-wrap gap-1 max-w-xs sm:max-w-md justify-center pointer-events-auto animate-fade-in">
          {fireworkTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onChangeFireworkType(t.id);
                setShowTypeMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer ${
                currentFireworkType === t.id
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-sm'
                  : 'bg-white/5 text-amber-200/80 hover:bg-white/10 hover:text-amber-100'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Elegant Floating Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-full bg-black/70 border border-amber-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.85)] pointer-events-auto max-w-full overflow-x-auto">
        
        {/* 1. Light a Diya */}
        <button
          onClick={onLightDiya}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap min-h-11"
          title="Light up another diya in the courtyard"
          aria-label="Light a Diya"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Light a Diya</span>
          <span className="sm:hidden">Diya</span>
        </button>

        {/* 2. Launch Fireworks */}
        <button
          onClick={onLaunchFirework}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-black/40 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap min-h-11"
          title="Launch colorful fireworks into the sky"
          aria-label="Launch Fireworks"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Launch Fireworks</span>
          <span className="sm:hidden">Firework</span>
        </button>

        {/* 3. Celebrate Again (Grand Finale) */}
        <button
          onClick={onGrandFinale}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 text-amber-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-11"
          title="Trigger a grand fireworks celebration show"
          aria-label="Celebrate Again with Grand Fireworks Finale"
        >
          <span className="text-xs">🎆</span>
          <span>Celebrate Again</span>
        </button>

        {/* 4. Sound Control */}
        <button
          onClick={onToggleSound}
          className="flex items-center gap-1.5 px-3 sm:px-3 py-2 sm:py-2.5 rounded-full bg-black/40 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap min-h-11"
          title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
          aria-label={isMuted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-amber-400/60" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>

        {/* 5. Camera View Toggle */}
        <button
          onClick={cycleCamera}
          className="flex items-center gap-1.5 px-3 sm:px-3 py-2 sm:py-2.5 rounded-full bg-black/40 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap min-h-11"
          title="Switch 3D camera angle"
          aria-label={`Toggle camera angle. Current: ${getCameraLabel()}`}
        >
          <Camera className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">{getCameraLabel()}</span>
        </button>

        {/* 6. Firework Style Picker */}
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="p-2 sm:px-3 sm:py-2.5 rounded-full bg-black/40 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap min-h-11"
          title="Change firework explosion style"
          aria-label="Change firework style"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </nav>
  );
});

InteractiveToolbar.displayName = 'InteractiveToolbar';
