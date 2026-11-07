import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiaryEntry, MoodType, UserProfile, AppTheme, ThemeId } from '../types';
import { THEMES, INITIAL_ENTRIES } from '../utils/constants';
import { ambientAudio } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface DiaryContextType {
  entries: DiaryEntry[];
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => DiaryEntry;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  activeTheme: AppTheme;
  setTheme: (themeId: ThemeId) => void;

  isLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  setPinCode: (pin: string | null) => void;

  activeTab: 'home' | 'journal' | 'calendar' | 'insights' | 'aura' | 'memories' | 'profile';
  setActiveTab: (tab: 'home' | 'journal' | 'calendar' | 'insights' | 'aura' | 'memories' | 'profile') => void;

  editingEntry: DiaryEntry | null;
  startNewEntry: (prefillDate?: string, prefillMood?: MoodType) => void;
  openEntryEditor: (entry: DiaryEntry) => void;
  closeEntryEditor: () => void;

  todayMood: MoodType | null;
  setTodayMood: (mood: MoodType) => void;

  streakCount: number;
  isMobileFrame: boolean;
  toggleMobileFrame: () => void;

  soundTrack: string | null;
  setSoundTrack: (track: string | null) => void;

  hasCompletedOnboarding: boolean;
  completeOnboarding: (name: string, theme: ThemeId, reminderTime: string) => void;
  resetAllData: () => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENTRIES: 'dear_diary_entries_v1',
  PROFILE: 'dear_diary_profile_v1',
  ONBOARDING: 'dear_diary_onboarded_v1',
  TODAY_MOOD: 'dear_diary_today_mood_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Evans',
  avatar: '🌸',
  email: 'evansamwelnyamu@gmail.com',
  bio: 'Seeking moments of quiet grace, mindful growth, and everyday wonder.',
  joinedDate: 'November 2026',
  dailyReminderEnabled: true,
  dailyReminderTime: '20:30',
  hasPinLock: false,
  pinCode: '',
  preferredTheme: 'lavender',
  soundscapeEnabled: true,
  streakCount: 4,
  lastJournaledDate: new Date().toISOString().split('T')[0],
};

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Entries State
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored entries', e);
    }
    return INITIAL_ENTRIES;
  });

  // 2. User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Error loading stored profile', e);
    }
    return DEFAULT_PROFILE;
  });

  // 3. Onboarding State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
    } catch (e) {
      return false;
    }
  });

  // 4. Pin Lock State
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !!(userProfile.hasPinLock && userProfile.pinCode);
  });

  // 5. Active Tab & Editor
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'calendar' | 'insights' | 'aura' | 'memories' | 'profile'>('home');
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // 6. Today's Mood Check-in
  const [todayMood, setTodayMoodState] = useState<MoodType | null>(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(STORAGE_KEYS.TODAY_MOOD);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed.mood;
      }
    } catch (e) {}
    return 'peaceful';
  });

  // 7. View Mode (Mobile Frame vs Full Edge-to-Edge)
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // 8. Soundscape audio state
  const [soundTrack, setSoundTrackState] = useState<string | null>(null);

  // Save entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving entries', e);
    }
  }, [entries]);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Error saving profile', e);
    }
  }, [userProfile]);

  const activeTheme = THEMES[userProfile.preferredTheme] || THEMES.lavender;

  // Streak calculation
  const calculateStreak = (entryList: DiaryEntry[]) => {
    if (!entryList.length) return 0;
    const sortedDates = Array.from(
      new Set(entryList.filter((e) => !e.isDraft).map((e) => e.date))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (!sortedDates.length) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user journaled today or yesterday to maintain streak
    const firstDate = sortedDates[0];
    if (firstDate !== today && firstDate !== yesterday) {
      return 0;
    }

    let currentStreak = 1;
    let expected = new Date(firstDate);

    for (let i = 1; i < sortedDates.length; i++) {
      expected.setDate(expected.getDate() - 1);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sortedDates[i] === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streakCount = Math.max(userProfile.streakCount, calculateStreak(entries));

  const setTodayMood = (mood: MoodType) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayMoodState(mood);
    try {
      localStorage.setItem(STORAGE_KEYS.TODAY_MOOD, JSON.stringify({ date: todayStr, mood }));
    } catch (e) {}

    // Small celebratory sparkle
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#E38B9F', '#9880C8', '#FDE047'],
    });
  };

  const addEntry = (entryData: Omit<DiaryEntry, 'id' | 'timestamp'>): DiaryEntry => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    setEntries((prev) => [newEntry, ...prev]);

    // Update streak and profile last journaled date
    const todayStr = new Date().toISOString().split('T')[0];
    setUserProfile((prev) => ({
      ...prev,
      lastJournaledDate: todayStr,
      streakCount: streakCount + (prev.lastJournaledDate !== todayStr ? 1 : 0),
    }));

    // Trigger celebratory confetti for publishing
    if (!newEntry.isDraft) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#9880C8', '#E38B9F', '#85715A', '#FBD38D'],
      });
      ambientAudio.playSingingBowl();
    }

    return newEntry;
  };

  const updateEntry = (id: string, updates: Partial<DiaryEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingEntry?.id === id) {
      setEditingEntry(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const setTheme = (themeId: ThemeId) => {
    updateUserProfile({ preferredTheme: themeId });
  };

  const unlockApp = (pin: string): boolean => {
    if (!userProfile.pinCode || userProfile.pinCode === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (userProfile.hasPinLock && userProfile.pinCode) {
      setIsLocked(true);
    }
  };

  const setPinCode = (pin: string | null) => {
    if (pin && pin.length >= 4) {
      updateUserProfile({ hasPinLock: true, pinCode: pin });
    } else {
      updateUserProfile({ hasPinLock: false, pinCode: '' });
      setIsLocked(false);
    }
  };

  const startNewEntry = (prefillDate?: string, prefillMood?: MoodType) => {
    const now = new Date();
    const dateStr = prefillDate || now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDraft: DiaryEntry = {
      id: '',
      title: '',
      content: '',
      date: dateStr,
      time: timeStr,
      timestamp: Date.now(),
      mood: prefillMood || todayMood || 'peaceful',
      moodIntensity: 4,
      tags: [],
      photos: [],
      isFavorite: false,
      isDraft: false,
    };
    setEditingEntry(newDraft);
    setActiveTab('journal');
  };

  const openEntryEditor = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setActiveTab('journal');
  };

  const closeEntryEditor = () => {
    setEditingEntry(null);
  };

  const toggleMobileFrame = () => {
    setIsMobileFrame((prev) => !prev);
  };

  const setSoundTrack = (track: string | null) => {
    setSoundTrackState(track);
    if (!track) {
      ambientAudio.stop();
    } else if (track === 'rain') {
      ambientAudio.playRain();
    } else if (track === 'forest') {
      ambientAudio.playForest();
    }
  };

  const completeOnboarding = (name: string, theme: ThemeId, reminderTime: string) => {
    updateUserProfile({
      name: name || 'Evans',
      preferredTheme: theme,
      dailyReminderTime: reminderTime,
    });
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    } catch (e) {}
  };

  const resetAllData = () => {
    setEntries(INITIAL_ENTRIES);
    setUserProfile(DEFAULT_PROFILE);
    setHasCompletedOnboarding(true);
    setTodayMoodState('peaceful');
    setIsLocked(false);
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(INITIAL_ENTRIES));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    } catch (e) {}
  };

  return (
    <DiaryContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleFavorite,
        userProfile,
        updateUserProfile,
        activeTheme,
        setTheme,
        isLocked,
        unlockApp,
        lockApp,
        setPinCode,
        activeTab,
        setActiveTab,
        editingEntry,
        startNewEntry,
        openEntryEditor,
        closeEntryEditor,
        todayMood,
        setTodayMood,
        streakCount,
        isMobileFrame,
        toggleMobileFrame,
        soundTrack,
        setSoundTrack,
        hasCompletedOnboarding,
        completeOnboarding,
        resetAllData,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
