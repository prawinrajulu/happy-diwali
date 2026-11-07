import React, { useState, memo } from 'react';
import { Share2, Check, UserPlus, ArrowLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndingSectionProps {
  visible: boolean;
  recipientName: string;
  onUpdateRecipient: (name: string) => void;
  onTriggerFireworks: () => void;
  onPrev: () => void;
}

export const EndingSection: React.FC<EndingSectionProps> = memo(({
  visible,
  recipientName,
  onUpdateRecipient,
  onTriggerFireworks,
  onPrev,
}) => {
  const [copied, setCopied] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [showPersonalize, setShowPersonalize] = useState(false);

  if (!visible) return null;

  const handleShare = async () => {
    onTriggerFireworks();

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.75 },
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
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (url: string) => {
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApplyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNameInput.trim()) {
      onUpdateRecipient(customNameInput.trim());
      setShowPersonalize(false);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('name', customNameInput.trim());
      window.history.pushState({}, '', newUrl);
    }
  };

  return (
    <div
      className="absolute top-14 sm:top-18 inset-x-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 pointer-events-none select-none animate-fade-in max-h-[calc(100vh-160px)] overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex flex-col items-center text-center max-w-lg sm:max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-black/75 border border-amber-500/25 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] pointer-events-auto my-auto">
        
        {/* Subtle Decorative Crest */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/25 bg-black/50 backdrop-blur-md mb-2">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span className="text-amber-300 font-serif tracking-[0.25em] text-[10px] sm:text-xs uppercase font-semibold">
            WISHING YOU AND YOUR FAMILY
          </span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>

        {/* Heading */}
        <h2 className="mt-1 text-2xl sm:text-4xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_15px_rgba(255,215,0,0.5)]">
          A VERY HAPPY & PROSPEROUS DIWALI!
        </h2>

        {recipientName ? (
          <p className="mt-2 text-xs sm:text-sm text-amber-200/90 font-medium italic">
            With warmest festive blessings for {recipientName} & Loved Ones 🪔
          </p>
        ) : (
          <p className="mt-2 text-xs sm:text-sm text-amber-200/75 font-light leading-relaxed">
            May health, fortune, and peaceful harmony bless your home throughout the year.
          </p>
        )}

        {/* Action Buttons: Share & Personalize */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <button
            onClick={handleShare}
            className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-amber-950 bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.6)] hover:shadow-[0_0_35px_rgba(251,191,36,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Share Diwali Greetings"
          >
            <Share2 className="w-4 h-4 text-amber-900" />
            <span>Share Diwali Blessings</span>
          </button>

          <button
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-amber-200 bg-black/50 border border-amber-500/30 hover:bg-white/10 hover:border-amber-400 transition-all cursor-pointer"
            aria-label="Personalize Wish with Name"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>{recipientName ? 'Change Name' : 'Personalize Wish'}</span>
          </button>
        </div>

        {/* Previous Navigation Button */}
        <div className="mt-5 pt-3.5 border-t border-amber-500/20 w-full flex items-center justify-between">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300/80 hover:text-amber-100 hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Previous: Return to Main Greeting"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>❮ Back: Main Greeting</span>
          </button>
          <span className="text-[10px] sm:text-[11px] text-amber-300/50 uppercase font-mono tracking-wider">
            Page 2 of 2
          </span>
        </div>

        {/* Personalize Input Form */}
        {showPersonalize && (
          <form onSubmit={handleApplyName} className="mt-4 w-full flex gap-2 max-w-sm animate-fade-in">
            <input
              type="text"
              placeholder="Enter recipient or family name..."
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="custom-name-input"
              autoFocus
              aria-label="Recipient Name"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Apply
            </button>
          </form>
        )}

        {/* Copied Feedback Toast */}
        {copied && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs animate-bounce shadow-lg">
            <Check className="w-3.5 h-3.5" />
            <span>Greeting Link Copied! Ready to send to loved ones.</span>
          </div>
        )}
      </div>
    </div>
  );
});

EndingSection.displayName = 'EndingSection';
