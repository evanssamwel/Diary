import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { MOODS } from '../utils/constants';
import { MoodType, DiaryEntry } from '../types';
import {
  PenLine,
  Search,
  Heart,
  Calendar,
  Filter,
  Sparkles,
  BookOpen,
  Tag,
  Clock,
} from 'lucide-react';

export const JournalListView: React.FC = () => {
  const { entries, openEntryEditor, startNewEntry, toggleFavorite } = useDiary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');

  // Extract all unique tags
  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags || []))
  );

  const filtered = entries.filter((entry) => {
    if (selectedMood !== 'all' && entry.mood !== selectedMood) return false;
    if (selectedTag !== 'all' && !entry.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title.toLowerCase().includes(q);
      const matchContent = entry.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Header with write button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">
            My Journal
          </h2>
          <p className="text-xs text-slate-400">
            {entries.length} reflections written
          </p>
        </div>

        <button
          onClick={() => startNewEntry()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Write Entry</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search in your memories..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
        />
      </div>

      {/* Tags Filter Pill Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedTag('all')}
          className={`text-[11px] px-3 py-1 rounded-xl font-medium shrink-0 transition ${
            selectedTag === 'all'
              ? 'bg-purple-600 text-white font-semibold'
              : 'bg-white/80 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Topics
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
            className={`text-[11px] px-3 py-1 rounded-xl font-medium shrink-0 transition ${
              selectedTag === tag
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-white/80 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Entries List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No entries found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or topic filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const meta = MOODS[entry.mood] || MOODS.reflective;
            const dateStr = new Date(entry.date + 'T12:00:00').toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }
            );

            return (
              <div
                key={entry.id}
                onClick={() => openEntryEditor(entry)}
                className="group bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer backdrop-blur-md relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={meta.label}>
                      {meta.emoji}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {dateStr} • {entry.time}
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
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        entry.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1.5">
                  {entry.title || 'Untitled Memory'}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {entry.content}
                </p>

                {entry.photos.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {entry.photos.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                      >
                        <img
                          src={p}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Tags */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {entry.content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
