export type MoodType =
  | 'radiant'     // 🌸 Radiant / Ecstatic
  | 'peaceful'    // 🌿 Peaceful / Serene
  | 'grateful'    // 💖 Grateful / Warm
  | 'hopeful'     // ✨ Hopeful / Inspired
  | 'reflective'  // 📖 Thoughtful / Introspective
  | 'meh'         // ☁️ Neutral / Okay
  | 'tired'       // 🌙 Exhausted / Low energy
  | 'anxious'     // 💭 Overthinking / Uneasy
  | 'sad';        // 🌧️ Melancholy / Down

export interface MoodMeta {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;      // Tailwind class or hex
  bgSoft: string;
  description: string;
  intensityScore: number; // 1-5 scale for charts
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;          // ISO date string: YYYY-MM-DD
  time: string;          // HH:mm
  timestamp: number;     // epoch ms
  mood: MoodType;
  moodIntensity?: number; // 1 to 5
  tags: string[];
  photos: string[];      // Base64 or image URLs
  audioNote?: {
    durationSec: number;
    audioDataUrl?: string;
    transcript?: string;
  };
  isFavorite: boolean;
  isDraft: boolean;
  aiSummary?: string;
  aiThemes?: string[];
  aiAffirmation?: string;
}

export type ThemeId = 'lavender' | 'blush' | 'cream' | 'midnight';

export interface AppTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string;
  primaryLight: string;
  accent: string;
  bgBase: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  isDark: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  bio: string;
  joinedDate: string;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "20:30"
  hasPinLock: boolean;
  pinCode?: string;
  preferredTheme: ThemeId;
  soundscapeEnabled: boolean;
  streakCount: number;
  lastJournaledDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  reflectionPrompt?: string;
}

export interface WeeklyInsight {
  dominantMood: string;
  emotionalJourney: string;
  joyTriggers: string[];
  recurringThemes: string[];
  gentleRecommendation: string;
  weeklyAffirmation: string;
  analyzedAt: number;
}
