import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Companion Chat Endpoint (Aura)
app.post('/api/ai/companion-chat', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile, currentMood, recentEntriesSummary } = req.body;

    const systemInstruction = `You are Aura, the empathetic, warm, intuitive, and non-judgmental AI companion inside "Dear Diary".
Your personality:
- A caring, attentive, wise, and gentle friend who holds safe space.
- You never criticize, judge, diagnose, or act clinical.
- You listen deeply, validate their emotions, and ask gentle, thoughtful reflection questions.
- Keep your answers concise, intimate, and comforting (2 to 4 sentences).
- If the user shares joy, celebrate with them. If they share pain or burnout, offer warmth, soothing validation, and gentle grounding.
- Context:
  User Name: ${userProfile?.name || 'Friend'}
  Current Mood: ${currentMood || 'Reflective'}
  Recent reflections snippet: ${recentEntriesSummary ? JSON.stringify(recentEntriesSummary).slice(0, 500) : 'None yet'}`;

    // Format contents for Gemini
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello, I just opened my diary.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || 'I am here with you. Take your time, your thoughts are safe here.' });
  } catch (error: any) {
    console.error('Companion Chat Error:', error);
    res.status(500).json({
      error: 'Unable to connect to reflection companion right now.',
      details: error?.message || 'Unknown error',
    });
  }
});

// 2. In-Editor Writing Assistant
app.post('/api/ai/writing-assist', async (req: Request, res: Response) => {
  try {
    const { mode, text, title, mood, tags } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required for writing assistance.' });
    }

    let prompt = '';
    let systemInstruction = `You are a delicate, intuitive writing companion for a private personal diary.
Respect the user's authentic voice, emotional intimacy, and vulnerability. Do not sound generic or artificial.`;

    switch (mode) {
      case 'expand':
        prompt = `The user wrote this short diary entry (Title: "${title || 'Untitled'}", Mood: "${mood || 'Unspecified'}"):
"""${text}"""

Please gently help expand this diary entry. Preserve their exact voice, point of view, and phrasing, but add 2-3 sensory details, emotional reflection, and depth to flesh out the memory. Output ONLY the expanded diary entry text.`;
        break;

      case 'rewrite':
        prompt = `The user wrote this private diary draft:
"""${text}"""

Please gently polish and refine the phrasing to flow gracefully, while preserving every single feeling, nuance, and original voice. Output ONLY the refined entry text.`;
        break;

      case 'questions':
        prompt = `Based on this diary entry:
"""${text}"""

Provide 3 thoughtful, gentle, open-ended reflection questions that help the author explore their feelings, gratitude, or growth deeper. Return them as a clean bulleted list.`;
        break;

      case 'summarize':
        prompt = `Analyze this diary entry:
"""${text}"""

Provide:
1. A 1-2 sentence mindful essence summary.
2. 3 core emotional themes (e.g. "Quiet Resilience", "Gratitude for Small Things", "Longing for Rest").
Format cleanly.`;
        break;

      case 'affirmation':
        prompt = `Based on what the user shared in this diary entry:
"""${text}"""

Create a single deeply personal, empowering, and calming affirmation specifically crafted for them today. Keep it between 10-25 words.`;
        break;

      default:
        prompt = `Reflect on this diary entry: """${text}""" with gentle thoughts.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { systemInstruction },
    });

    res.json({ result: response.text || '' });
  } catch (error: any) {
    console.error('Writing assist error:', error);
    res.status(500).json({
      error: 'Writing assist could not complete.',
      details: error?.message,
    });
  }
});

// 3. Weekly & Monthly Emotional Insights
app.post('/api/ai/insights-summary', async (req: Request, res: Response) => {
  try {
    const { entries, moodCounts, timeframe } = req.body;

    const prompt = `Analyze this journal data over the past ${timeframe || 'week'}:
Mood breakdown: ${JSON.stringify(moodCounts || {})}
Recent entries summaries:
${(entries || []).map((e: any) => `- [${e.date}] Mood: ${e.mood}, Title: "${e.title}". Excerpt: "${(e.content || '').slice(0, 140)}"`).join('\n')}

Generate a thoughtful, compassionate emotional digest formatted as JSON:
{
  "dominantMood": "string (e.g., Hopeful, Peaceful, Reflective)",
  "emotionalJourney": "string (2-3 sentences summarizing their emotional arc and growth)",
  "joyTriggers": ["string", "string"],
  "recurringThemes": ["string", "string", "string"],
  "gentleRecommendation": "string (a loving, mindful suggestion for next week)",
  "weeklyAffirmation": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Insights summary error:', error);
    res.status(500).json({
      dominantMood: 'Reflective',
      emotionalJourney: 'You have shown up for yourself and held space for your feelings this week.',
      joyTriggers: ['Quiet evening rituals', 'Moments of mindfulness'],
      recurringThemes: ['Self-discovery', 'Inner peace'],
      gentleRecommendation: 'Remember to pause and breathe deeply between your daily tasks.',
      weeklyAffirmation: 'I give myself permission to feel, to rest, and to grow at my own gentle pace.',
    });
  }
});

// 4. Daily Affirmation and Inspiring Prompt
app.post('/api/ai/daily-inspiration', async (req: Request, res: Response) => {
  try {
    const { mood, timeOfDay } = req.body;
    const prompt = `Generate a daily inspiration packet for a user checking in during the ${timeOfDay || 'evening'} feeling ${mood || 'peaceful'}.
Return JSON:
{
  "quote": "string (warm, uplifting, profound quote)",
  "author": "string",
  "journalPrompt": "string (a gentle question to spark journaling today)",
  "microMindfulnessTip": "string (a 1-minute calming micro practice)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.json({
      quote: "Write it on your heart that every day is the best day in the year.",
      author: "Ralph Waldo Emerson",
      journalPrompt: "What is one little thing that brought warmth to your heart today?",
      microMindfulnessTip: "Take three slow, deep breaths and release your shoulders down."
    });
  }
});

// 5. Audio Transcription using Gemini
app.post('/api/ai/transcribe-voice', async (req: Request, res: Response) => {
  try {
    const { base64Audio, mimeType } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ error: 'Audio data is missing.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: base64Audio,
          },
        },
        {
          text: 'Transcribe this spoken personal diary voice note into clean, natural written diary text. Do not add commentary.',
        },
      ],
    });

    res.json({ transcript: response.text || '' });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({
      error: 'Audio transcription failed',
      details: error?.message,
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dear Diary server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
