/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiaryProvider, useDiary } from './context/DiaryContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { JournalEditor } from './components/JournalEditor';
import { JournalListView } from './components/JournalListView';
import { AuraCompanion } from './components/AuraCompanion';
import { MoodTrackerView } from './components/MoodTrackerView';
import { CalendarView } from './components/CalendarView';
import { MemoriesView } from './components/MemoriesView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { PinLockModal } from './components/PinLockModal';
import { OnboardingModal } from './components/OnboardingModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    editingEntry,
    isLocked,
    hasCompletedOnboarding,
    isMobileFrame,
    activeTheme,
  } = useDiary();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'journal':
        return editingEntry ? <JournalEditor /> : <JournalListView />;
      case 'aura':
        return <AuraCompanion />;
      case 'calendar':
        return <CalendarView />;
      case 'insights':
        return <MoodTrackerView />;
      case 'memories':
        return <MemoriesView />;
      case 'profile':
        return <ProfileSettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 ${
        activeTheme.isDark ? 'dark bg-[#120F1A]' : 'bg-[#F6F3EE]'
      } flex items-center justify-center sm:p-4`}
    >
      {/* Optional Smartphone Frame Mockup for desktop users */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isMobileFrame
            ? 'sm:max-w-[430px] sm:h-[900px] sm:max-h-[95vh] sm:rounded-[48px] sm:border-[8px] sm:border-slate-800 dark:sm:border-slate-700 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] sm:overflow-hidden'
            : 'max-w-2xl min-h-screen'
        } ${activeTheme.bgBase}`}
      >
        {/* Mobile Dynamic Island / Notch on frame */}
        {isMobileFrame && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-transparent absolute top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="w-28 h-5 bg-slate-900 rounded-full flex items-center justify-between px-3">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-slate-700" />
            </div>
          </div>
        )}

        {/* Top Header */}
        <Header />

        {/* Main Scrollable Screen Body */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 no-scrollbar">
          {renderActiveScreen()}
        </main>

        {/* Bottom Floating Navigation (hide in editor mode so writer has distraction-free focus) */}
        {!(activeTab === 'journal' && editingEntry) && <Navigation />}

        {/* Passcode Lock Screen */}
        {isLocked && <PinLockModal />}

        {/* First-time Welcome & Theme Onboarding */}
        {!hasCompletedOnboarding && <OnboardingModal />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DiaryProvider>
      <AppContent />
    </DiaryProvider>
  );
}
