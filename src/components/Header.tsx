import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import {
  Flame,
  Volume2,
  VolumeX,
  Lock,
  Smartphone,
  Maximize2,
  Sparkles,
  Heart,
} from 'lucide-react';
import { AmbientSoundModal } from './AmbientSoundModal';

export const Header: React.FC = () => {
  const {
    streakCount,
    isMobileFrame,
    toggleMobileFrame,
    soundTrack,
    setSoundTrack,
    lockApp,
    userProfile,
    activeTheme,
    setActiveTab,
  } = useDiary();

  const [showSoundModal, setShowSoundModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 px-4 py-3 backdrop-blur-xl border-b transition-colors duration-300 bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-300 via-purple-300 to-indigo-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-purple-900" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                Dear Diary
                <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                your safe space
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Streak Counter Badge */}
            <div
              title={`${streakCount} day journaling streak!`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streakCount}</span>
            </div>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={() => setShowSoundModal(true)}
              title="Calming soundscapes"
              className={`p-2 rounded-full transition-all text-xs flex items-center justify-center relative ${
                soundTrack
                  ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 ring-2 ring-purple-300/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {soundTrack ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </>
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Lock Button (if PIN set) */}
            {userProfile.hasPinLock && (
              <button
                onClick={lockApp}
                title="Lock Diary"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Mobile / Desktop frame switcher */}
            <button
              onClick={toggleMobileFrame}
              title={isMobileFrame ? 'Expand to wide screen' : 'Switch to mobile phone frame'}
              className="hidden sm:flex p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isMobileFrame ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {showSoundModal && (
        <AmbientSoundModal onClose={() => setShowSoundModal(false)} />
      )}
    </>
  );
};
