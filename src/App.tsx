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

type PageState = 'hero' | 'courtyard' | 'blessings';

export function App() {
  const [isIntro, setIsIntro] = useState(true);
  const [diyasLitCount, setDiyasLitCount] = useState(1);
  const [cameraMode, setCameraMode] = useState<'courtyard' | 'sky' | 'cinematic'>('courtyard');
  const [fireworkType, setFireworkType] = useState<FireworkType>('chrysanthemum');
  const [recipientName, setRecipientName] = useState('');
  const [activeTab, setActiveTab] = useState<PageState>('hero');
  const [isMuted, setIsMuted] = useState(false);

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

    // Trigger welcoming fireworks burst on outer wings
    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'multi-layer');
    }, 450);

    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'willow-gold');
    }, 1000);

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
    if (activeTab === 'hero') {
      setActiveTab('courtyard');
    } else if (activeTab === 'courtyard') {
      fireworksRef.current?.launchRocket(undefined, undefined, 'multi-layer');
      setActiveTab('blessings');
    }

    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [activeTab]);

  const handlePrevTab = useCallback(() => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;

    soundManager.playDiyaChime();
    if (activeTab === 'blessings') {
      setActiveTab('courtyard');
    } else if (activeTab === 'courtyard') {
      setActiveTab('hero');
    }

    setTimeout(() => {
      transitionLockRef.current = false;
    }, 350);
  }, [activeTab]);

  const handleToggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      return next;
    });
  }, []);

  const handleDiyaClick = useCallback(() => {
    setDiyasLitCount((prev) => prev + 1);
  }, []);

  const handleLightDiyaButton = useCallback(() => {
    soundManager.playDiyaChime();
    setDiyasLitCount((prev) => prev + 1);
    fireworksRef.current?.launchRocket(undefined, undefined, 'willow-gold');
  }, []);

  const handleLaunchFireworkButton = useCallback(() => {
    fireworksRef.current?.launchRocket(undefined, undefined, fireworkType);
  }, [fireworkType]);

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
      className="relative w-full h-full overflow-hidden bg-[#020308] select-none"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#020308',
        touchAction: 'manipulation',
      }}
    >
      {/* 1. Optimized 3D WebGL Palace Courtyard Scene (Always full screen) */}
      <DiwaliCanvas3D
        isIntro={isIntro}
        diyasLitCount={diyasLitCount}
        onDiyaClick={handleDiyaClick}
        cameraMode={cameraMode}
      />

      {/* 2. Zero-Allocation Pooled Fireworks Engine (Clean Center Zone) */}
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
          {/* Top Navigation Bar: rendered only on Page 1 (hero) and Page 3 (blessings), strictly REMOVED on Page 2 (courtyard) */}
          {activeTab !== 'courtyard' && (
            <AudioControls
              diyasLitCount={diyasLitCount}
              activeTab={activeTab === 'hero' ? 'hero' : 'ending'}
              onPrevTab={handlePrevTab}
              onNextTab={handleNextTab}
              isMuted={isMuted}
              onToggleSound={handleToggleSound}
            />
          )}

          {/* PAGE 1: Main Diwali Wish Reveal */}
          <DiwaliWishHero
            visible={activeTab === 'hero'}
            recipientName={recipientName}
            onNext={handleNextTab}
          />

          {/* PAGE 2: Clean, Immersive 3D Courtyard with Single Prominent Action Button */}
          {activeTab === 'courtyard' && (
            <div
              className="absolute bottom-6 sm:bottom-10 inset-x-0 z-30 flex flex-col items-center pointer-events-none select-none px-4 pb-[env(safe-area-inset-bottom,0px)] animate-fade-in-up"
            >
              <button
                onClick={handleNextTab}
                className="group relative pointer-events-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 rounded-full font-serif font-bold text-sm sm:text-base md:text-lg text-amber-950 bg-linear-to-r from-[#FFF0A6] via-[#FFD700] to-[#D97706] shadow-[0_0_35px_rgba(251,191,36,0.65)] hover:shadow-[0_0_55px_rgba(251,191,36,0.95)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-[#FFF9DB]/70 animate-pulse-glow max-w-[90vw] min-h-[48px]"
                aria-label="View Family Blessings and Wishes"
              >
                {/* Diya Icon */}
                <span className="text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] group-hover:scale-110 transition-transform">
                  🪔
                </span>
                
                {/* Button Typography */}
                <span className="tracking-wider">
                  View Family Blessings & Wishes
                </span>

                {/* Subtle glassmorphism halo */}
                <span className="absolute -inset-1 rounded-full bg-amber-400/35 blur-md group-hover:blur-lg transition-all -z-10" />
              </button>
            </div>
          )}

          {/* DESTINATION PAGE: Family Blessings & Wishes Section */}
          <EndingSection
            visible={activeTab === 'blessings'}
            recipientName={recipientName}
            onUpdateRecipient={setRecipientName}
            onTriggerFireworks={handleGrandFinale}
            onPrev={handlePrevTab}
          />

          {/* Bottom Floating Interactive Toolbar: shown only on Page 1 (hero), strictly REMOVED on Page 2 (courtyard) and Blessings page */}
          {activeTab === 'hero' && (
            <InteractiveToolbar
              onLightDiya={handleLightDiyaButton}
              onLaunchFirework={handleLaunchFireworkButton}
              onGrandFinale={handleGrandFinale}
              isMuted={isMuted}
              onToggleSound={handleToggleSound}
              cameraMode={cameraMode}
              onChangeCameraMode={setCameraMode}
              currentFireworkType={fireworkType}
              onChangeFireworkType={setFireworkType}
            />
          )}
        </>
      )}
    </main>
  );
}

export default App;
