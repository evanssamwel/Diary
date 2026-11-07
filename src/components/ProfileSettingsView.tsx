import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { THEMES } from '../utils/constants';
import { ThemeId } from '../types';
import {
  User,
  Shield,
  Lock,
  Download,
  Bell,
  Palette,
  Check,
  Flame,
  FileText,
  RotateCcw,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_OPTIONS = ['🌸', '🌿', '🌙', '✨', '☕', '🐱', '🦋', '🌊'];

export const ProfileSettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    setTheme,
    setPinCode,
    entries,
    resetAllData,
  } = useDiary();

  const [name, setName] = useState(userProfile.name);
  const [bio, setBio] = useState(userProfile.bio);
  const [reminderTime, setReminderTime] = useState(userProfile.dailyReminderTime);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Stats
  const totalEntries = entries.length;
  const totalWords = entries.reduce((acc, curr) => {
    return acc + curr.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const favoriteCount = entries.filter((e) => e.isFavorite).length;

  // Handle Profile Update
  const handleSaveProfile = () => {
    updateUserProfile({ name, bio, dailyReminderTime: reminderTime });
    confetti({ particleCount: 20, spread: 40 });
  };

  // PIN Save
  const handleSavePin = () => {
    if (newPin.length >= 4) {
      setPinCode(newPin);
      setPinSuccessMsg('Passcode successfully enabled! 🔒');
      setNewPin('');
      setTimeout(() => setPinSuccessMsg(''), 3000);
      setShowPinSetup(false);
    } else {
      alert('Please enter at least 4 digits for your passcode.');
    }
  };

  const handleRemovePin = () => {
    setPinCode(null);
    setPinSuccessMsg('Passcode removed.');
    setTimeout(() => setPinSuccessMsg(''), 3000);
  };

  // Export JSON
  const exportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `dear-diary-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Markdown
  const exportMarkdown = () => {
    const mdContent = entries
      .map((e) => {
        return `# ${e.title || 'Untitled Memory'}
*Date: ${e.date} ${e.time} | Mood: ${e.mood} | Tags: ${e.tags.join(', ')}*

${e.content}

${e.aiAffirmation ? `> **Affirmation**: ${e.aiAffirmation}` : ''}
---
`;
      })
      .join('\n\n');

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `dear-diary-memories-${new Date().toISOString().split('T')[0]}.md`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-200 to-rose-200 dark:from-purple-900/50 dark:to-rose-900/50 flex items-center justify-center text-3xl shadow-inner">
            {userProfile.avatar}
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-slate-100">
              {userProfile.name}
            </h3>
            <p className="text-xs text-slate-400">
              Journaling since {userProfile.joinedDate}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
              "{userProfile.bio}"
            </p>
          </div>
        </div>

        {/* Avatar picker row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 shrink-0 font-medium mr-1">
            Avatar:
          </span>
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av}
              onClick={() => updateUserProfile({ avatar: av })}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base border transition ${
                userProfile.avatar === av
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-950 scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {av}
            </button>
          ))}
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40">
            <p className="font-serif font-bold text-lg text-purple-900 dark:text-purple-200">
              {totalEntries}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Entries
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40">
            <p className="font-serif font-bold text-lg text-rose-900 dark:text-rose-200">
              {totalWords}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Words
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40">
            <p className="font-serif font-bold text-lg text-amber-900 dark:text-amber-200 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              {userProfile.streakCount}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">
              Streak
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md space-y-3">
        <h4 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          <span>Edit Profile</span>
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Bio / Personal Motto
          </label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
        >
          Save Changes
        </button>
      </div>

      {/* Theme Customization */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md space-y-3">
        <h4 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-rose-500" />
          <span>Aesthetic Theme</span>
        </h4>
        <p className="text-xs text-slate-400">
          Tailor the colors of your journaling sanctuary.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
            const t = THEMES[tId];
            const isSelected = userProfile.preferredTheme === tId;
            return (
              <button
                key={tId}
                onClick={() => setTheme(tId)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/50 ring-2 ring-purple-300 dark:ring-purple-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: t.accent }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {t.isDark ? 'Dark Mode' : 'Pastel'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy & Passcode Lock */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Passcode & Biometrics</span>
          </h4>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              userProfile.hasPinLock
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
            }`}
          >
            {userProfile.hasPinLock ? 'Active' : 'Disabled'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Require a 4-digit code or simulated biometric unlock whenever the app opens.
        </p>

        {pinSuccessMsg && (
          <p className="text-xs text-emerald-600 font-semibold animate-fadeIn">
            {pinSuccessMsg}
          </p>
        )}

        {showPinSetup ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Enter 4-Digit Passcode:
            </label>
            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1234"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowPinSetup(false)}
                className="w-1/2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="w-1/2 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition"
              >
                Set Lock
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {!userProfile.hasPinLock ? (
              <button
                onClick={() => setShowPinSetup(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Set Up Passcode</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Change Passcode
                </button>
                <button
                  onClick={handleRemovePin}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition"
                >
                  Remove Lock
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Daily Reminder Notifications */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md space-y-3">
        <h4 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Journaling Reminders</span>
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Evening Reflection Prompt
            </p>
            <p className="text-[11px] text-slate-400">
              Gentle chime reminding you to write
            </p>
          </div>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => {
              setReminderTime(e.target.value);
              updateUserProfile({ dailyReminderTime: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md space-y-3">
        <h4 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-600" />
          <span>Export & Backup</span>
        </h4>
        <p className="text-xs text-slate-400">
          Keep your thoughts forever. Export cleanly to JSON, Markdown, or print format.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={exportJson}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-center transition"
          >
            <FileText className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <span className="text-xs font-semibold block">JSON Data</span>
            <span className="text-[9px] text-slate-400">Full Backup</span>
          </button>

          <button
            onClick={exportMarkdown}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-center transition"
          >
            <FileText className="w-5 h-5 mx-auto mb-1 text-rose-500" />
            <span className="text-xs font-semibold block">Markdown</span>
            <span className="text-[9px] text-slate-400">Readable .md</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-center transition"
          >
            <Download className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <span className="text-xs font-semibold block">Print / PDF</span>
            <span className="text-[9px] text-slate-400">Physical Keepsake</span>
          </button>
        </div>

        {/* Reset Demo Data */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">Restore demo samples</span>
          <button
            onClick={() => {
              if (confirm('Restore sample entries and reset demo data?')) {
                resetAllData();
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
};
