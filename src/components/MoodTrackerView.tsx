import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { MOODS } from '../utils/constants';
import { MoodType, WeeklyInsight } from '../types';
import {
  Sparkles,
  TrendingUp,
  BarChart2,
  Calendar,
  Compass,
  Heart,
  Loader2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MoodTrackerView: React.FC = () => {
  const { entries, todayMood, setTodayMood } = useDiary();

  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Filter entries by timeframe
  const daysLimit = timeframe === '7days' ? 7 : 30;
  const cutoff = Date.now() - daysLimit * 86400000;
  const filteredEntries = entries.filter((e) => e.timestamp >= cutoff);

  // Count moods
  const moodCounts: Record<string, number> = {};
  (Object.keys(MOODS) as MoodType[]).forEach((m) => {
    moodCounts[m] = 0;
  });

  filteredEntries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  // Most frequent mood
  let dominantMoodKey: MoodType = 'peaceful';
  let maxCount = -1;
  Object.entries(moodCounts).forEach(([k, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantMoodKey = k as MoodType;
    }
  });

  const dominantMeta = MOODS[dominantMoodKey] || MOODS.peaceful;

  // Chart data: chronological mood points (1-5 scale)
  const sortedForChart = [...filteredEntries].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const chartPoints = sortedForChart.map((e, index) => {
    const meta = MOODS[e.mood] || MOODS.reflective;
    const score = e.moodIntensity || meta.intensityScore || 3;
    return {
      date: new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score, // 1 to 5
      mood: e.mood,
      title: e.title,
    };
  });

  // Calculate Tag correlations
  const tagMoodMap: Record<string, { total: number; positive: number }> = {};
  filteredEntries.forEach((entry) => {
    const isPos = ['radiant', 'peaceful', 'grateful', 'hopeful'].includes(
      entry.mood
    );
    entry.tags.forEach((tag) => {
      if (!tagMoodMap[tag]) tagMoodMap[tag] = { total: 0, positive: 0 };
      tagMoodMap[tag].total += 1;
      if (isPos) tagMoodMap[tag].positive += 1;
    });
  });

  const correlations = Object.entries(tagMoodMap)
    .filter(([_, data]) => data.total >= 1)
    .map(([tag, data]) => ({
      tag,
      posPercent: Math.round((data.positive / data.total) * 100),
      count: data.total,
    }))
    .sort((a, b) => b.posPercent - a.posPercent)
    .slice(0, 4);

  // Generate Weekly AI Emotional Digest
  const generateEmotionalDigest = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/ai/insights-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: filteredEntries.slice(0, 8),
          moodCounts,
          timeframe: timeframe === '7days' ? 'past 7 days' : 'past month',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInsight({ ...data, analyzedAt: Date.now() });
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.5 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Title & Timeframe toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">
            Mood Insights
          </h2>
          <p className="text-xs text-slate-400">
            Discover patterns in your emotional landscape
          </p>
        </div>

        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              timeframe === '7days'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              timeframe === '30days'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Dominant Mood Highlight Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-100/90 via-rose-50/80 to-amber-50/80 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-800/80 flex items-center justify-center text-3xl shadow-xs border border-purple-200/50 dark:border-slate-700">
            {dominantMeta.emoji}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Dominant Vibe
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
              {dominantMeta.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dominantMeta.description}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-serif text-purple-700 dark:text-purple-300">
            {filteredEntries.length}
          </span>
          <p className="text-[10px] text-slate-400">check-ins</p>
        </div>
      </div>

      {/* Interactive Mood Trend Wave Graph */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100">
              Emotional Arc
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Highs & Stillness (Scale 1–5)
          </span>
        </div>

        {chartPoints.length < 2 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Log at least two diary entries to see your emotional arc graph.
          </div>
        ) : (
          <div className="space-y-2">
            {/* SVG Chart */}
            <div className="h-36 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                {/* Horizontal guide lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                <line x1="0" y1="60" x2="320" y2="60" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                <line x1="0" y1="100" x2="320" y2="100" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />

                {/* SVG Curve path */}
                {(() => {
                  const points = chartPoints.map((p, i) => {
                    const x = (i / (chartPoints.length - 1)) * 300 + 10;
                    // Invert: score 5 is y=15, score 1 is y=105
                    const y = 110 - (p.score / 5) * 90;
                    return { x, y, ...p };
                  });

                  const pathStr = points.reduce((acc, curr, idx) => {
                    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                  }, '');

                  return (
                    <>
                      {/* Gradient area underneath */}
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9880C8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#9880C8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${pathStr} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`}
                        fill="url(#waveGradient)"
                      />
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#8367BA"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="4.5"
                          className="fill-white stroke-purple-600 stroke-2 hover:scale-125 transition-transform cursor-pointer"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Date labels */}
            <div className="flex justify-between text-[10px] text-slate-400 px-1 pt-1">
              <span>{chartPoints[0]?.date}</span>
              <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.date}</span>
              <span>{chartPoints[chartPoints.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mood Distribution Breakdown */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          <span>Emotion Distribution</span>
        </h3>

        <div className="space-y-2.5">
          {(Object.keys(MOODS) as MoodType[]).map((mKey) => {
            const m = MOODS[mKey];
            const count = moodCounts[mKey] || 0;
            const total = filteredEntries.length || 1;
            const pct = Math.round((count / total) * 100);

            if (count === 0 && timeframe === '7days') return null;

            return (
              <div key={mKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </span>
                  <span className="text-slate-400 font-semibold">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-rose-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag & Emotion Correlations */}
      {correlations.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100">
              Joy Anchors & Patterns
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {correlations.map((corr, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700"
              >
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  #{corr.tag}
                </p>
                <p className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100">
                  {corr.posPercent}%
                </p>
                <p className="text-[10px] text-slate-400">Radiant or Peaceful days</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly AI Emotional Digest Section */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-purple-50 via-rose-50/60 to-amber-50/70 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/60 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                AI Emotional Digest
              </h3>
              <p className="text-[11px] text-slate-500">
                Intelligent reflection synthesis
              </p>
            </div>
          </div>

          <button
            onClick={generateEmotionalDigest}
            disabled={loadingInsight}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            {loadingInsight ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{insight ? 'Regenerate' : 'Analyze Week'}</span>
          </button>
        </div>

        {insight ? (
          <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-fadeIn">
            <div>
              <span className="font-bold text-purple-800 dark:text-purple-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                Emotional Arc & Growth
              </span>
              <p className="font-sans leading-relaxed">{insight.emotionalJourney}</p>
            </div>

            {insight.recurringThemes && (
              <div>
                <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Recurring Inner Themes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {insight.recurringThemes.map((thm, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-slate-700 font-medium"
                    >
                      {thm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insight.gentleRecommendation && (
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-purple-200/50 dark:border-slate-700">
                <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                  🌿 Loving Nudge for Next Week
                </span>
                <p>{insight.gentleRecommendation}</p>
              </div>
            )}

            {insight.weeklyAffirmation && (
              <div className="p-3 rounded-2xl bg-purple-100/60 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-center">
                <p className="font-serif italic font-semibold text-purple-950 dark:text-purple-200 text-sm">
                  "{insight.weeklyAffirmation}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Tap "Analyze Week" to have Aura synthesize your recent entries, uncover recurring emotional themes, and craft a personalized mindful affirmation.
          </p>
        )}
      </div>
    </div>
  );
};
