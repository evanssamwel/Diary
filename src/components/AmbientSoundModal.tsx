import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { ambientAudio } from '../utils/audioSynth';
import { Volume2, VolumeX, CloudRain, Trees, Bell, X, Sparkles } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AmbientSoundModal: React.FC<Props> = ({ onClose }) => {
  const { soundTrack, setSoundTrack } = useDiary();
  const [volume, setVolume] = useState(0.5);

  const handleSelect = (track: 'rain' | 'forest') => {
    if (soundTrack === track) {
      setSoundTrack(null);
    } else {
      setSoundTrack(track);
    }
  };

  const handleChime = () => {
    ambientAudio.playSingingBowl();
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    ambientAudio.setVolume(newVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100">
            Calming Soundscapes
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Pure synthesized white noise to help you focus, unwind, and write freely.
        </p>

        {/* Sound options */}
        <div className="space-y-2.5 mb-6">
          {/* Rain */}
          <button
            onClick={() => handleSelect('rain')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              soundTrack === 'rain'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  soundTrack === 'rain'
                    ? 'bg-purple-200 dark:bg-purple-900 text-purple-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                <CloudRain className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Gentle Rain</p>
                <p className="text-xs opacity-75">Soft raindrops on glass</p>
              </div>
            </div>
            {soundTrack === 'rain' && (
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                Playing
              </span>
            )}
          </button>

          {/* Forest Breeze */}
          <button
            onClick={() => handleSelect('forest')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              soundTrack === 'forest'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  soundTrack === 'forest'
                    ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                <Trees className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Forest Whispers</p>
                <p className="text-xs opacity-75">Wind through pine branches</p>
              </div>
            </div>
            {soundTrack === 'forest' && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Playing
              </span>
            )}
          </button>

          {/* Solfeggio Singing Bowl chime button */}
          <button
            onClick={handleChime}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 hover:bg-amber-100/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-800">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Singing Bowl Chime</p>
                <p className="text-xs opacity-75">Tap to play 396Hz grounding chime</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-200 dark:bg-amber-900/60 font-medium">
              Chime 🔔
            </span>
          </button>
        </div>

        {/* Volume slider */}
        {soundTrack && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5" /> Ambient Volume
              </span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Stop all button */}
        {soundTrack && (
          <button
            onClick={() => setSoundTrack(null)}
            className="mt-4 w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 dark:border-rose-900 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5"
          >
            <VolumeX className="w-4 h-4" /> Stop Ambient Sounds
          </button>
        )}
      </div>
    </div>
  );
};
