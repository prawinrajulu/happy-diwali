import React, { useState } from 'react';
import { Share2, Sparkles, Copy, Check, Heart, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndingSectionProps {
  visible: boolean;
  recipientName: string;
  onUpdateRecipient: (name: string) => void;
  onTriggerFireworks: () => void;
}

export const EndingSection: React.FC<EndingSectionProps> = ({
  visible,
  recipientName,
  onUpdateRecipient,
  onTriggerFireworks,
}) => {
  const [copied, setCopied] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [showPersonalize, setShowPersonalize] = useState(false);

  if (!visible) return null;

  const handleShare = async () => {
    onTriggerFireworks();

    // Trigger golden celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.8 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#FF69B4']
    });

    const shareUrl = window.location.href;
    const shareTitle = `🪔 Happy Diwali Wishes ${recipientName ? `from ${recipientName}` : ''}!`;
    const shareText = `Wishing you and your family a very Happy and Prosperous Diwali! Light up the sky with 3D fireworks here:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to clipboard if user dismissed or error
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleApplyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNameInput.trim()) {
      onUpdateRecipient(customNameInput.trim());
      setShowPersonalize(false);
      // Update browser URL query param cleanly without reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('name', customNameInput.trim());
      window.history.pushState({}, '', newUrl);
    }
  };

  return (
    <div className="absolute bottom-20 sm:bottom-24 inset-x-0 z-20 flex flex-col items-center pointer-events-none px-4 select-none animate-fade-in">
      <div className="flex flex-col items-center text-center max-w-xl mx-auto p-6 rounded-3xl bg-black/65 border border-amber-500/30 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.85)] pointer-events-auto">
        <span className="text-amber-300 font-serif tracking-[0.25em] text-xs sm:text-sm uppercase font-semibold">
          WISHING YOU AND YOUR FAMILY
        </span>

        <h2 className="mt-2 text-2xl sm:text-4xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-[0_2px_15px_rgba(255,215,0,0.5)]">
          A VERY HAPPY & PROSPEROUS DIWALI!
        </h2>

        {recipientName && (
          <p className="mt-2 text-xs sm:text-sm text-amber-200/90 font-medium italic">
            With warmest festive blessings for {recipientName} & Loved Ones 🪔
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleShare}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm sm:text-base font-semibold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:shadow-[0_0_40px_rgba(251,191,36,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-amber-900" />
            <span>✨ Share the Diwali Happiness</span>
          </button>

          <button
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-medium text-amber-200 bg-black/50 border border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>{recipientName ? 'Change Name' : 'Personalize Wish'}</span>
          </button>
        </div>

        {/* Personalize Input Form Modal/Flyout */}
        {showPersonalize && (
          <form onSubmit={handleApplyName} className="mt-4 w-full flex gap-2 max-w-sm animate-fade-in">
            <input
              type="text"
              placeholder="Enter your or friend's name..."
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-black/70 border border-amber-500/50 text-amber-100 placeholder:text-amber-400/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-300"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-xs sm:text-sm transition-all"
            >
              Apply
            </button>
          </form>
        )}

        {/* Copied Toast Alert */}
        {copied && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs animate-bounce">
            <Check className="w-3.5 h-3.5" />
            <span>Greeting Link Copied to Clipboard! Ready to paste & send.</span>
          </div>
        )}
      </div>
    </div>
  );
};

