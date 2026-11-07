# 🌸 Dear Diary — AI-Powered Personal Journal & Mood Companion

> *"Your thoughts deserve a safe space."*

**Dear Diary** is a modern, mobile-first personal journaling sanctuary designed to help you gently unpack your day, track your emotional wellbeing, preserve cherished memories, and reflect with **Aura**, an empathetic, non-judgmental AI companion.

Built with a soothing pastel aesthetic, elegant serif typography, rounded cards, ambient soundscapes, and full offline persistence, Dear Diary combines the intimacy of a paper journal with the mindful intelligence of modern AI.

---

## ✨ Key Features

### 1. 🏠 Home Dashboard
- **Time-Aware Personalized Greeting**: Adapts gracefully throughout the day (*"Good morning"*, *"Good evening"*).
- **Daily Mood Check-In**: 9 expressive emotions (🌸 *Radiant*, 🌿 *Peaceful*, 💖 *Grateful*, ✨ *Hopeful*, 📖 *Reflective*, ☁️ *So-so*, 🌙 *Exhausted*, 💭 *Anxious*, 🌧️ *Heavyhearted*) with celebratory confetti micro-interactions.
- **Journaling Streak Tracker**: Daily streak counter celebrating consistent mindful habits.
- **Weekly Calendar Mini-Strip**: 7-day quick glance showing days you've penned reflections.
- **Daily Inspirational Cards**: Dynamic mindful quotes, micro-mindfulness exercises, and guided prompts curated by Gemini AI.
- **Recent Memories Feed**: Clean cards with mood badges, favorite hearts, tags, and photo previews.

---

### 2. ✍️ Distraction-Free Journal Editor
- **Rich Writing Canvas**: Comfortably formatted typography designed for vulnerable, free-flowing writing.
- **Automatic Timestamps & Backdating**: Auto-stamped with time and date, with support for retrospective writing.
- **Mood & Intensity Depth**: Select your emotion and rate its intensity (1 to 5 stars).
- **Voice Notes & AI Audio Transcription**: Record spoken thoughts with a built-in microphone recorder, listen to audio playback, and transcribe spoken reflections into written text with one tap using Gemini.
- **Photo Memories**: Upload your own snapshots or pick from calming nature moments (morning tea, lavender petals, rainy window).
- **Topic Tags**: Tag entries with `#Gratitude`, `#Reflections`, `#SelfCare`, `#Nature`, `#Dreams`, or custom tags.
- **Drafts & Private Publishing**: Keep private notes as drafts or publish with gentle sound celebrations.

---

### 3. 🪄 In-Editor AI Writing Assistant
Accessible directly inside the editor to support you whenever you feel stuck:
- **Help Expand**: Adds sensory details and gentle emotional depth without changing your authentic voice.
- **Gentle Polish**: Polishes flow and phrasing while preserving your real feelings.
- **Reflect Deeper**: Generates 3 open-ended questions tailored to your entry to spark deeper self-discovery.
- **Themes & Essence**: Synthesizes a mindful summary and identifies core emotional themes.
- **Personalized Affirmation**: Crafts a personalized daily affirmation tailored specifically to the feelings in that entry.

---

### 4. 🌸 Aura — Empathetic AI Companion
A warm, supportive, and non-judgmental friend holding space whenever you need an ear:
- **No Judgment, No Clinical Jargon**: Validates your feelings, listens attentively, and asks gentle questions.
- **Guided Reflection Journeys**:
  - 🌙 *Bedtime Unwind*: Release daily tensions and prepare for deep rest.
  - ☀️ *Morning Clarity*: Set an intention before the world rushes in.
  - 💖 *Gratitude Flow*: Notice small pockets of quiet joy.
  - 🌧️ *Unpack a Heavy Feeling*: Hold space for vulnerability and anxiety safely.
- **Save to Diary**: Turn any heartfelt dialogue with Aura directly into a saved diary entry with one click.

---

### 5. 📊 Mood Tracker & Emotional Insights
- **Emotional Arc Wave**: Interactive SVG trend curve tracking your feelings over 7 or 30 days.
- **Emotion Distribution**: Clean visual breakdown showing how often each feeling was experienced.
- **Joy Anchors & Patterns**: Uncovers correlations between your tags and positive moods (e.g., `#Nature` yielding 95% Radiant days).
- **Weekly AI Emotional Digest**: Gemini analyzes your recent week, synthesizing your emotional journey, recurring themes, and a loving recommendation for the upcoming week.

---

### 6. 📅 Interactive Calendar & Timeline
- Full monthly view highlighting days with diary entries in color-coded mood badges.
- Search entries by title, body, or `#tags`.
- Filter by specific mood states.
- Tap any date to view memories from that day or write a retrospective memory.

---

### 7. 📸 Nostalgic Memories & Keepsakes
- **"On This Day" Time Machine**: Revisit what your heart was feeling weeks or months ago.
- **Favorites Collection**: Quickly access memories you’ve marked with a heart.
- **Polaroid Photo Gallery**: A visual mosaic of photo moments and captions.

---

### 8. 🔒 Privacy, Security & Offline Freedom
- **100% Private by Default**: Your diary stays private on your device using browser `localStorage`.
- **Passcode & Biometric App Lock**: Secure PIN lock screen (with simulated biometric FaceID unlock) to protect your diary from prying eyes.
- **Data Portability & Export**:
  - 📦 Full **JSON** backup export.
  - 📄 Clean, readable **Markdown (.md)** export.
  - 🖨️ Formatted **Print / PDF** keepsake.

---

### 9. 🎵 Built-In Ambient Soundscapes
Pure synthesized Web Audio soundscapes that run completely offline without external audio files:
- 🌧️ **Gentle Rain**: Soothing pink-noise rain simulation.
- 🌲 **Forest Whispers**: Ambient wind through trees.
- 🔔 **Solfeggio Singing Bowl Chime**: 396Hz grounding chime to center yourself before writing.
- Master volume controls.

---

### 10. 🎨 Aesthetic Themes & View Modes
- **Lavender Mist**: Soft lilac, wisteria blooms, and creamy lavender.
- **Blush Bloom**: Rose petals, blush cream, and morning glow.
- **Oat & Linen**: Earthy minimalist ivory, clay, and warm neutrals.
- **Midnight Velvet**: Deep starlit plum and indigo for peaceful night-time journaling.
- **Smartphone Frame vs. Fullscreen**: Desktop users can toggle between an iPhone-style mockup frame and a full-width experience.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Custom CSS theme variables |
| **Typography** | Plus Jakarta Sans, Playfair Display, Caveat |
| **Icons & Micro-animations** | Lucide React, Canvas Confetti |
| **Sound Synthesis** | Web Audio API (Oscillators, Biquad Filters, Pink Noise) |
| **Server & Backend** | Express, Node.js, `tsx` |
| **AI Integration** | `@google/genai` TypeScript SDK (Server-Side) |
| **Gemini Models** | `gemini-3.8-flash` (Companion, Writing Assist, Digest), `gemini-3.5-transcribe` (Voice notes) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A Gemini API Key (configured automatically in Google AI Studio or set in `.env`)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 3. Run Development Server
Start the full-stack dev server (Express + Vite middleware):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📱 Mobile Installation (PWA / Add to Home Screen)
Dear Diary is designed mobile-first:
1. Open the app URL in Safari (iOS) or Chrome (Android).
2. Tap the **Share** button (iOS) or the **Three Dots** menu (Android).
3. Select **"Add to Home Screen"**.
4. Enjoy a full-screen, native-app journaling experience with no browser chrome.

---

## 🛡️ Privacy Statement
Your thoughts, memories, and emotions belong solely to you. Diary entries are stored in your private local browser storage. AI prompts are processed securely on the server without storing or sharing your private diary data publicly.
