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

export function App() {
  const [isIntro, setIsIntro] = useState(true);
  const [diyasLitCount, setDiyasLitCount] = useState(1);
  const [cameraMode, setCameraMode] = useState<'courtyard' | 'sky' | 'cinematic'>('courtyard');
  const [fireworkType, setFireworkType] = useState<FireworkType>('chrysanthemum');
  const [recipientName, setRecipientName] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'ending'>('hero');
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
      {/* 1. Optimized 3D WebGL Palace Courtyard Scene */}
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
          {/* Top Minimal Navigation Bar with Minimized Diya Counter & Sound */}
          <AudioControls
            diyasLitCount={diyasLitCount}
            activeTab={activeTab}
            onPrevTab={handlePrevTab}
            onNextTab={handleNextTab}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />

          {/* Page 1: Main Diwali Wish Reveal */}
          <DiwaliWishHero
            visible={activeTab === 'hero'}
            recipientName={recipientName}
            onNext={handleNextTab}
          />

          {/* Page 2: Special Ending Section with Share */}
          <EndingSection
            visible={activeTab === 'ending'}
            recipientName={recipientName}
            onUpdateRecipient={setRecipientName}
            onTriggerFireworks={handleGrandFinale}
            onPrev={handlePrevTab}
          />

          {/* Bottom Floating Interactive Toolbar */}
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
        </>
      )}
    </main>
  );
}

export default App;
