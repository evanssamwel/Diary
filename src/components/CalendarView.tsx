import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { MOODS } from '../utils/constants';
import { MoodType, DiaryEntry } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Heart,
  Filter,
  Search,
  BookOpen,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { entries, openEntryEditor, startNewEntry, toggleFavorite } = useDiary();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateIso, setSelectedDateIso] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & total days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (selectedMoodFilter !== 'all' && e.mood !== selectedMoodFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchContent = e.content.toLowerCase().includes(q);
      const matchTags = e.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  // Entries for selected date
  const selectedDayEntries = filteredEntries.filter(
    (e) => e.date === selectedDateIso
  );

  return (
    <div className="space-y-5 pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Title & Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">
            Memory Calendar
          </h2>
          <p className="text-xs text-slate-400">
            A visual timeline of your days and feelings
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-sm text-slate-800 dark:text-slate-100 px-2 min-w-[120px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Mood Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries or #tags..."
            className="bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none w-full"
          />
        </div>

        <select
          value={selectedMoodFilter}
          onChange={(e) => setSelectedMoodFilter(e.target.value)}
          className="px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-xs"
        >
          <option value="all">All Moods</option>
          {(Object.keys(MOODS) as MoodType[]).map((mk) => (
            <option key={mk} value={mk}>
              {MOODS[mk].emoji} {MOODS[mk].label}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Grid Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day numbers */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDate = new Date(year, month, dayNum);
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = iso === selectedDateIso;
            const isToday =
              iso === new Date().toISOString().split('T')[0];

            const dayEntries = filteredEntries.filter((e) => e.date === iso);
            const firstEntry = dayEntries[0];
            const moodMeta = firstEntry ? MOODS[firstEntry.mood] : null;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateIso(iso)}
                className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-between border transition-all duration-200 relative ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-300 dark:ring-purple-700 shadow-sm'
                    : isToday
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isSelected
                      ? 'text-purple-700 dark:text-purple-300 font-bold'
                      : isToday
                      ? 'text-purple-600 font-bold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Entry marker */}
                <div className="h-5 flex items-center justify-center">
                  {moodMeta ? (
                    <span className="text-xs" title={moodMeta.label}>
                      {moodMeta.emoji}
                    </span>
                  ) : dayEntries.length > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-transparent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Memories Drawer */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <span>
                {new Date(selectedDateIso + 'T12:00:00').toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {selectedDayEntries.length}{' '}
              {selectedDayEntries.length === 1 ? 'entry' : 'entries'} on this date
            </p>
          </div>

          <button
            onClick={() => startNewEntry(selectedDateIso)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Entry</span>
          </button>
        </div>

        {selectedDayEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <BookOpen className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
            <p className="text-xs">No memories recorded on this day.</p>
            <button
              onClick={() => startNewEntry(selectedDateIso)}
              className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Add a retrospective note
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayEntries.map((entry) => {
              const meta = MOODS[entry.mood] || MOODS.reflective;
              return (
                <div
                  key={entry.id}
                  onClick={() => openEntryEditor(entry)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                      <span className="text-slate-400 font-normal">
                        • {entry.time}
                      </span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(entry.id);
                      }}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          entry.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                    {entry.title || 'Untitled Moment'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
