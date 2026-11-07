import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { ThemeId } from '../types';
import { THEMES } from '../utils/constants';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Palette,
  Bell,
  ArrowRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { completeOnboarding, hasCompletedOnboarding, userProfile } = useDiary();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(userProfile.name || 'Evans');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('lavender');
  const [reminderTime, setReminderTime] = useState('20:30');

  if (hasCompletedOnboarding) return null;

  const handleFinish = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    completeOnboarding(name, selectedTheme, reminderTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-rose-200/50 dark:bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-purple-600 dark:bg-purple-400'
                    : s < step
                    ? 'w-3 bg-purple-300 dark:bg-purple-800'
                    : 'w-3 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-400">
            Step {step} of 3
          </span>
        </div>

        {/* STEP 1: Welcome & Mission */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-200 via-rose-200 to-amber-200 flex items-center justify-center shadow-sm">
              <Sparkles className="w-8 h-8 text-purple-900" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                Welcome to Dear Diary
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                Your thoughts deserve a safe space.
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A private digital sanctuary to unload your day, reflect on emotions,
              cherish precious memories, and converse with Aura, your empathetic AI companion.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  100% Private: your journal entries stay private on your device.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <Heart className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Gentle, non-judgmental guidance whenever you need an ear.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or pen name"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-98 transition"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Choose Aesthetic Theme */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-200 to-purple-200 flex items-center justify-center shadow-sm">
              <Palette className="w-8 h-8 text-rose-800" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                Visual Comfort
              </p>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                Choose your aesthetic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select the color palette that makes your journaling feel cozy.
              </p>
            </div>

            <div className="space-y-3">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isSelected = selectedTheme === tId;
                return (
                  <button
                    key={tId}
                    onClick={() => setSelectedTheme(tId)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-black/10 shadow-xs flex items-center justify-center text-white"
                        style={{ backgroundColor: t.accent }}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {t.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.tagline}
                        </p>
                      </div>
                    </div>
                    {t.isDark && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                        Dark
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Reminder & Finish */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-200 to-rose-200 flex items-center justify-center shadow-sm">
              <Bell className="w-8 h-8 text-amber-900" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                Gentle Habit
              </p>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                Daily Journaling Reminder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Most reflective writers enjoy checking in during the quiet of evening.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Preferred Reflection Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-mono font-bold focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                We will send a warm, non-intrusive notification to invite you to unwind.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-500 hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-98 transition"
              >
                Open My Diary <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
