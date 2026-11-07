import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { MOODS } from '../utils/constants';
import { DiaryEntry } from '../types';
import {
  Heart,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  ChevronRight,
  BookMarked,
  Filter,
} from 'lucide-react';

export const MemoriesView: React.FC = () => {
  const { entries, openEntryEditor, toggleFavorite } = useDiary();
  const [activeSubTab, setActiveSubTab] = useState<'onThisDay' | 'favorites' | 'photos'>('onThisDay');

  // Favorites
  const favoriteEntries = entries.filter((e) => e.isFavorite);

  // Photo memories
  const photoEntries = entries.filter((e) => e.photos && e.photos.length > 0);

  // "On This Day" calculation: entries on the same day-of-month or 7 days / 30 days ago
  const today = new Date();
  const currentDay = today.getDate();

  const onThisDayEntries = entries.filter((e) => {
    const d = new Date(e.date + 'T12:00:00');
    // Check if day of month matches or older than 2 days
    return d.getDate() === currentDay || e.timestamp < Date.now() - 86400000 * 2;
  });

  return (
    <div className="space-y-5 pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">
          Treasured Memories
        </h2>
        <p className="text-xs text-slate-400">
          Reflect on past seasons and favorite moments
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
        <button
          onClick={() => setActiveSubTab('onThisDay')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'onThisDay'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>On This Day</span>
        </button>

        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'favorites'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Favorites ({favoriteEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('photos')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'photos'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos</span>
        </button>
      </div>

      {/* 1. On This Day Flashbacks */}
      {activeSubTab === 'onThisDay' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-100/90 to-rose-100/80 dark:from-slate-900 dark:to-purple-950/40 border border-purple-200/60 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-800/80 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-slate-100">
                Time Machine
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gently revisiting where your heart was in earlier weeks and seasons.
              </p>
            </div>
          </div>

          {onThisDayEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No entries match previous anniversary days yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {onThisDayEntries.map((entry) => {
                const meta = MOODS[entry.mood] || MOODS.peaceful;
                const dateObj = new Date(entry.date + 'T12:00:00');
                const diffDays = Math.round(
                  (Date.now() - dateObj.getTime()) / 86400000
                );

                return (
                  <div
                    key={entry.id}
                    onClick={() => openEntryEditor(entry)}
                    className="p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {diffDays === 0
                          ? 'Today'
                          : diffDays === 1
                          ? 'Yesterday'
                          : `${diffDays} days ago`}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(entry.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 transition"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            entry.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{meta.emoji}</span>
                      <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                        {entry.title || 'Untitled Memory'}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                      {entry.content}
                    </p>

                    {entry.aiSummary && (
                      <p className="text-[11px] italic font-serif text-purple-800 dark:text-purple-300 p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-slate-800">
                        "{entry.aiSummary}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Starred / Favorites */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-3">
          {favoriteEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-400" />
              <p className="text-xs">No favorite memories starred yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tap the heart on any entry you want to hold close.
              </p>
            </div>
          ) : (
            favoriteEntries.map((entry) => {
              const meta = MOODS[entry.mood] || MOODS.peaceful;
              return (
                <div
                  key={entry.id}
                  onClick={() => openEntryEditor(entry)}
                  className="p-5 rounded-3xl bg-white/85 dark:bg-slate-900/85 border border-rose-200/70 dark:border-slate-800 shadow-xs hover:border-rose-300 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </div>

                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <span>{meta.emoji}</span>
                    <span>{entry.title || 'Untitled Memory'}</span>
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. Photo Polaroid Gallery */}
      {activeSubTab === 'photos' && (
        <div className="space-y-3">
          {photoEntries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No photos attached to entries yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photoEntries.flatMap((entry) =>
                entry.photos.map((photoUrl, pIdx) => (
                  <div
                    key={`${entry.id}-${pIdx}`}
                    onClick={() => openEntryEditor(entry)}
                    className="p-2.5 pb-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2">
                      <img
                        src={photoUrl}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-serif font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                      {entry.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {entry.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
