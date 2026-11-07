import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DiwaliCanvas3D } from './components/DiwaliCanvas3D';
import { FireworksCanvas, FireworksHandle, FireworkType } from './components/FireworksCanvas';
import { IntroScreen } from './components/IntroScreen';
import { DiwaliWishHero } from './components/DiwaliWishHero';
import { EndingSection } from './components/EndingSection';
import { AudioControls } from './components/AudioControls';
import { InteractiveToolbar } from './components/InteractiveToolbar';
import { soundManager } from './audio/soundManager';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const [isIntro, setIsIntro] = useState(true);
  const [diyasLitCount, setDiyasLitCount] = useState(1);
  const [cameraMode, setCameraMode] = useState<'courtyard' | 'sky' | 'cinematic'>('courtyard');
  const [fireworkType, setFireworkType] = useState<FireworkType>('chrysanthemum');
  const [recipientName, setRecipientName] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'ending'>('hero');

  const fireworksRef = useRef<FireworksHandle | null>(null);
  const transitionLockRef = useRef<boolean>(false);

  // Read URL search params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get('name');
      if (nameParam) {
        setRecipientName(nameParam);
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  // Keyboard navigation for accessibility: ArrowRight -> Next, ArrowLeft -> Prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isIntro) return;
      if (e.key === 'ArrowRight') {
        handleNextTab();
      } else if (e.key === 'ArrowLeft') {
        handlePrevTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIntro, activeTab]);

  const handleStartExperience = useCallback(() => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;

    setIsIntro(false);
    setDiyasLitCount(11);

    // Audio starts only upon explicit visitor gesture
    soundManager.startAmbientFestiveMusic();
    soundManager.playDiyaChime();

    // Trigger welcoming fireworks burst
    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'multi-layer');
    }, 500);

    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'chrysanthemum');
    }, 1100);

    // Celebration confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });

    setTimeout(() => {
      transitionLockRef.current = false;
    }, 600);
  }, []);

  const handleNextTab = useCallback(() => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;

    soundManager.playDiyaChime();
    setActiveTab('ending');

    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, []);

  const handlePrevTab = useCallback(() => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;

    soundManager.playDiyaChime();
    setActiveTab('hero');

    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, []);

  const handleDiyaClick = useCallback(() => {
    setDiyasLitCount((prev) => prev + 1);
  }, []);

  const handleLightDiyaButton = useCallback(() => {
    soundManager.playDiyaChime();
    setDiyasLitCount((prev) => prev + 1);
    fireworksRef.current?.launchRocket(undefined, undefined, 'willow-gold');
  }, []);

  const handleGrandFinale = useCallback(() => {
    fireworksRef.current?.triggerGrandFinale();

    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.65 },
      colors: ['#FFD700', '#FF1744', '#00E676', '#2979FF', '#FF9100']
    });
  }, []);

  return (
    <main
      className="relative w-full h-full overflow-hidden bg-[#03040a] select-none"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#03040a',
        touchAction: 'manipulation',
      }}
    >
      {/* 1. Optimized 3D WebGL Palace Courtyard Scene */}
      <DiwaliCanvas3D
        isIntro={isIntro}
        diyasLitCount={diyasLitCount}
        onDiyaClick={handleDiyaClick}
        cameraMode={cameraMode}
      />

      {/* 2. Zero-Allocation Pooled Fireworks Engine */}
      <FireworksCanvas
        ref={fireworksRef}
        active={!isIntro}
      />

      {/* 3. Opening Intro Screen */}
      <IntroScreen
        visible={isIntro}
        onStart={handleStartExperience}
      />

      {/* 4. Active Celebration Overlays & Controls */}
      {!isIntro && (
        <>
          {/* Top Audio & Navigation Bar */}
          <AudioControls diyasLitCount={diyasLitCount} />

          {/* Master Step Navigation Controller (Prev / Tabs / Next) */}
          <nav
            aria-label="Diwali Celebration Steps"
            className="absolute top-14 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2 p-1 rounded-full bg-black/75 border border-amber-500/35 backdrop-blur-md pointer-events-auto shadow-lg"
          >
            {/* Prev Button */}
            <button
              onClick={handlePrevTab}
              disabled={activeTab === 'hero'}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'text-amber-500/30 cursor-not-allowed'
                  : 'text-amber-300 hover:bg-white/10 hover:text-amber-100 active:scale-95'
              }`}
              title="Previous Step"
              aria-label="Previous Section"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Tab 1 */}
            <button
              onClick={handlePrevTab}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
              aria-current={activeTab === 'hero' ? 'page' : undefined}
            >
              1. Main Wish
            </button>

            {/* Tab 2 */}
            <button
              onClick={handleNextTab}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'ending'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
              aria-current={activeTab === 'ending' ? 'page' : undefined}
            >
              2. Blessings & Share
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextTab}
              disabled={activeTab === 'ending'}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'ending'
                  ? 'text-amber-500/30 cursor-not-allowed'
                  : 'text-amber-300 hover:bg-white/10 hover:text-amber-100 active:scale-95'
              }`}
              title="Next Step"
              aria-label="Next Section"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          {/* Section 1: Main Diwali Wish Reveal */}
          <DiwaliWishHero
            visible={activeTab === 'hero'}
            recipientName={recipientName}
            onNext={handleNextTab}
          />

          {/* Section 2: Special Ending Section with Share */}
          <EndingSection
            visible={activeTab === 'ending'}
            recipientName={recipientName}
            onUpdateRecipient={setRecipientName}
            onTriggerFireworks={handleGrandFinale}
            onPrev={handlePrevTab}
          />

          {/* Bottom Interactive Toolbar Dock */}
          <InteractiveToolbar
            onGrandFinale={handleGrandFinale}
            onLightDiya={handleLightDiyaButton}
            cameraMode={cameraMode}
            onChangeCameraMode={setCameraMode}
            currentFireworkType={fireworkType}
            onChangeFireworkType={setFireworkType}
          />
        </>
      )}
    </main>
  );
}

export default App;
