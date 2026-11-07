import React, { useState, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';
import { MOODS, DAILY_PROMPTS } from '../utils/constants';
import { MoodType, DiaryEntry } from '../types';
import {
  PenLine,
  Mic,
  Sparkles,
  Heart,
  Quote,
  ChevronRight,
  Calendar,
  Flame,
  ArrowRight,
  Compass,
  Bookmark,
  RefreshCw,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    userProfile,
    entries,
    todayMood,
    setTodayMood,
    startNewEntry,
    openEntryEditor,
    toggleFavorite,
    streakCount,
    setActiveTab,
  } = useDiary();

  // Daily inspiration state
  const [inspiration, setInspiration] = useState<{
    quote: string;
    author: string;
    journalPrompt: string;
    microMindfulnessTip: string;
  }>({
    quote: 'There is a quiet grace in simply showing up for yourself each day.',
    author: 'Dear Diary Reflections',
    journalPrompt: DAILY_PROMPTS[0],
    microMindfulnessTip: 'Relax your shoulders, unfurl your brow, and take one deep slow breath.',
  });

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: '🌅', desc: 'A fresh, unwritten day awaits.' };
    if (hour < 17) return { text: 'Good afternoon', icon: '☀️', desc: 'Take a gentle breath midway.' };
    if (hour < 21) return { text: 'Good evening', icon: '🌆', desc: 'How was your heart today?' };
    return { text: 'Good night', icon: '🌙', desc: 'Unwind and leave your day on the page.' };
  };

  const greeting = getGreeting();

  // Fetch AI daily inspiration
  const fetchNewInspiration = async () => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch('/api/ai/daily-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: todayMood,
          timeOfDay: greeting.text.toLowerCase(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInspiration(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Recent entries (published + drafts)
  const recentEntries = entries.slice(0, 4);

  // Calculate 7-day mini calendar strip
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    // Monday as start of week or last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const entryForDay = entries.find((e) => e.date === iso);
      days.push({
        date: d,
        iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        isToday: i === 0,
        hasEntry: !!entryForDay,
        entryMood: entryForDay ? entryForDay.mood : null,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Total words written across diary
  const totalWords = entries.reduce((acc, curr) => {
    const words = curr.content.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-purple-100/90 via-rose-50/80 to-amber-50/70 dark:from-slate-800/90 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/50 dark:border-slate-800 shadow-sm">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{greeting.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                {greeting.text}, {userProfile.name}
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {greeting.desc}
            </h2>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-xs border border-purple-200/60 dark:border-slate-700">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {streakCount} {streakCount === 1 ? 'day' : 'days'}
                </span>
                <p className="text-[9px] text-slate-400 leading-none">streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Mini Strip */}
        <div className="mt-5 pt-4 border-t border-purple-200/40 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-1">
            {weekDays.map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const existing = entries.find((e) => e.date === w.iso);
                  if (existing) {
                    openEntryEditor(existing);
                  } else {
                    startNewEntry(w.iso);
                  }
                }}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
                  w.isToday
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold scale-105'
                    : 'hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-80">
                  {w.dayName}
                </span>
                <span className="text-xs font-bold mt-0.5">{w.dayNum}</span>
                <div className="h-2 flex items-center justify-center mt-1">
                  {w.hasEntry ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-300 ring-2 ring-white/50" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Mood Check-In */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Today's Feeling</span>
              {todayMood && (
                <span className="text-xs font-sans font-normal text-purple-600 dark:text-purple-400">
                  • {MOODS[todayMood]?.label}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tap how your heart feels right now
            </p>
          </div>
          <button
            onClick={() => setActiveTab('insights')}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
          >
            Trends <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mood Emoji Scroll Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(Object.keys(MOODS) as MoodType[]).map((mKey) => {
            const mood = MOODS[mKey];
            const isSelected = todayMood === mKey;
            return (
              <button
                key={mKey}
                onClick={() => setTodayMood(mKey)}
                className={`flex flex-col items-center p-2.5 rounded-2xl min-w-[62px] border transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-400 dark:border-purple-600 scale-105 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl mb-1 transition-transform group-hover:scale-110">
                  {mood.emoji}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-tight ${
                    isSelected
                      ? 'text-purple-800 dark:text-purple-200 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quick Action Write Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => startNewEntry()}
          className="p-4 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/20 active:scale-98 transition flex flex-col justify-between h-28 text-left group"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center group-hover:rotate-6 transition-transform">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-medium text-purple-200">New Entry</span>
            <p className="font-serif font-bold text-base text-white">Write Thoughts</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('aura')}
          className="p-4 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg shadow-rose-500/20 active:scale-98 transition flex flex-col justify-between h-28 text-left group"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-medium text-rose-100">AI Companion</span>
            <p className="font-serif font-bold text-base text-white">Reflect with Aura</p>
          </div>
        </button>
      </div>

      {/* Daily Inspirational Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-50/70 via-rose-50/50 to-purple-50/70 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 border border-amber-200/60 dark:border-slate-800 shadow-xs relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            <Quote className="w-3.5 h-3.5 fill-amber-500/30" />
            <span>Daily Inspiration</span>
          </div>
          <button
            onClick={fetchNewInspiration}
            disabled={isLoadingQuote}
            className="p-1.5 rounded-full hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300 transition"
            title="Generate fresh inspiration"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuote ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="font-serif italic text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
          "{inspiration.quote}"
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1 font-medium">
          — {inspiration.author}
        </p>

        {/* Guided Micro Prompt */}
        <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-slate-800 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-200/70 dark:bg-amber-900/50 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="font-bold text-amber-800 dark:text-amber-400">Prompt: </span>
              {inspiration.journalPrompt}
            </p>
            <button
              onClick={() => {
                startNewEntry(undefined, todayMood || 'reflective');
              }}
              className="mt-2 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1 hover:underline"
            >
              Write on this prompt <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Diary Entries List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100">
              Recent Memories
            </h3>
            <p className="text-xs text-slate-400">
              {entries.length} memories penned • {totalWords} words
            </p>
          </div>
          <button
            onClick={() => setActiveTab('journal')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="text-center py-10 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
            <PenLine className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-serif text-base font-semibold text-slate-700 dark:text-slate-300">
              Your diary is waiting for its first page
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
              Write whatever comes to mind. Even two sentences is a memory preserved.
            </p>
            <button
              onClick={() => startNewEntry()}
              className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-sm hover:bg-purple-700 transition"
            >
              Start First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => {
              const moodMeta = MOODS[entry.mood] || MOODS.reflective;
              const dateFormatted = new Date(entry.date + 'T12:00:00').toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
              );

              return (
                <div
                  key={entry.id}
                  onClick={() => openEntryEditor(entry)}
                  className="group bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={moodMeta.label}>
                        {moodMeta.emoji}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {dateFormatted} • {entry.time}
                      </span>
                      {entry.isDraft && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          Draft
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(entry.id);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          entry.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mb-1">
                    {entry.title || 'Untitled Memory'}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {entry.content}
                  </p>

                  {/* Tags and photo badge */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {entry.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {entry.photos.length > 0 && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        📷 {entry.photos.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
