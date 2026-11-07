import React, { useState, useEffect, useRef } from 'react';
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

  const fireworksRef = useRef<FireworksHandle | null>(null);

  // Read URL search params on mount (e.g. ?name=Amit)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('name');
    if (nameParam) {
      setRecipientName(nameParam);
    }
  }, []);

  const handleStartExperience = () => {
    setIsIntro(false);
    setDiyasLitCount(11); // Initial courtyard diya count

    // Start procedural festive raga soundtrack
    soundManager.startAmbientFestiveMusic();
    soundManager.playDiyaChime();

    // Trigger welcoming fireworks burst
    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'multi-layer');
    }, 600);
    setTimeout(() => {
      fireworksRef.current?.launchRocket(undefined, undefined, 'chrysanthemum');
    }, 1200);

    // Subtle celebratory golden confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
  };

  const handleDiyaClick = () => {
    setDiyasLitCount((prev) => prev + 1);
  };

  const handleLightDiyaButton = () => {
    soundManager.playDiyaChime();
    setDiyasLitCount((prev) => prev + 1);

    // Launch a celebratory golden willow firework
    fireworksRef.current?.launchRocket(undefined, undefined, 'willow-gold');
  };

  const handleGrandFinale = () => {
    fireworksRef.current?.triggerGrandFinale();

    // Confetti shower
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF1744', '#00E676', '#2979FF', '#FF9100']
    });
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#03040a]"
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#03040a' }}
    >
      {/* 1. 3D WebGL Palace Courtyard & Diya Scene */}
      <DiwaliCanvas3D
        isIntro={isIntro}
        diyasLitCount={diyasLitCount}
        onDiyaClick={handleDiyaClick}
        cameraMode={cameraMode}
      />

      {/* 2. Interactive Realistic Fireworks Canvas Engine */}
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

          {/* Tab Pill to switch between Hero Wish and Special Family Ending Section */}
          <div className="absolute top-16 sm:top-5 left-1/2 -translate-x-1/2 z-30 flex items-center p-1 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md pointer-events-auto">
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3 sm:px-4 py-1 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-amber-400 text-amber-950 shadow-md'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
            >
              Festival Greeting
            </button>
            <button
              onClick={() => setActiveTab('ending')}
              className={`px-3 sm:px-4 py-1 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'ending'
                  ? 'bg-amber-400 text-amber-950 shadow-md'
                  : 'text-amber-200/80 hover:text-amber-100'
              }`}
            >
              Share & Blessings
            </button>
          </div>

          {/* Section 5: Main Diwali Wish Reveal */}
          <DiwaliWishHero
            visible={activeTab === 'hero'}
            recipientName={recipientName}
          />

          {/* Section 7: Special Ending Section with Share */}
          <EndingSection
            visible={activeTab === 'ending'}
            recipientName={recipientName}
            onUpdateRecipient={setRecipientName}
            onTriggerFireworks={handleGrandFinale}
          />

          {/* Section 6: Interactive Bottom Toolbar Dock */}
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
    </div>
  );
}

export default App;

