import React, { useState, useRef, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';
import { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  Heart,
  Moon,
  Sun,
  Coffee,
  CloudRain,
  Feather,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const GUIDED_JOURNEYS = [
  {
    id: 'bedtime',
    label: 'Bedtime Unwind',
    icon: Moon,
    desc: 'Release today’s tension before sleep',
    starter:
      'I am ready to unwind for the night. Can you guide me through a gentle 3-step evening reflection to leave my day behind?',
  },
  {
    id: 'morning',
    label: 'Morning Clarity',
    icon: Sun,
    desc: 'Set a peaceful intention for today',
    starter:
      'Good morning Aura. What is a gentle question I should ask myself to start today with mindfulness and calm?',
  },
  {
    id: 'gratitude',
    label: 'Gratitude Flow',
    icon: Heart,
    desc: 'Find 3 small pockets of joy',
    starter:
      'I want to notice the quiet blessings around me today. Can you ask me something to help me spark deep gratitude?',
  },
  {
    id: 'heavy',
    label: 'Unpack Heavy Feeling',
    icon: CloudRain,
    desc: 'Hold space for hurt or anxiety',
    starter:
      'I am feeling a bit overwhelmed and heavyhearted today. Can we talk through it slowly without any pressure?',
  },
];

const INITIAL_AURA_MESSAGES: ChatMessage[] = [
  {
    id: 'aura-welcome',
    role: 'assistant',
    content:
      'Hello dear friend. I am Aura, your quiet reflection companion. This space is entirely yours—no judgment, no expectations, just an empathetic ear. Would you like to tell me more about how your heart is feeling today?',
    timestamp: Date.now() - 3600000,
  },
];

export const AuraCompanion: React.FC = () => {
  const { userProfile, todayMood, entries, addEntry, setActiveTab } = useDiary();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('dear_diary_aura_chat_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_AURA_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-save chat history
  useEffect(() => {
    try {
      localStorage.setItem('dear_diary_aura_chat_v1', JSON.stringify(messages));
    } catch (e) {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Summarize recent entries for context
      const recentSummary = entries.slice(0, 3).map((e) => ({
        date: e.date,
        mood: e.mood,
        title: e.title,
      }));

      const res = await fetch('/api/ai/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.slice(-8), // Send last 8 messages for context
          userProfile,
          currentMood: todayMood,
          recentEntriesSummary: recentSummary,
        }),
      });

      if (!res.ok) {
        throw new Error('Connection to companion failed');
      }

      const data = await res.json();
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };
      setMessages([...newHistory, replyMsg]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'I am holding space for you, even if the connection feels quiet for a second. Take a slow, comforting breath. I am here.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Convert conversation into a saved diary entry
  const saveAsJournalEntry = () => {
    const dialogue = messages
      .filter((m) => m.id !== 'aura-welcome')
      .map((m) => `${m.role === 'user' ? 'Me' : 'Aura'}: ${m.content}`)
      .join('\n\n');

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    addEntry({
      title: 'Heartfelt conversation with Aura',
      content: dialogue || 'A moment of gentle reflection with Aura.',
      date: todayStr,
      time: nowTime,
      mood: todayMood || 'reflective',
      moodIntensity: 4,
      tags: ['AuraConversation', 'Reflection', 'SelfCare'],
      photos: [],
      isFavorite: false,
      isDraft: false,
    });

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });

    setActiveTab('journal');
  };

  const clearChat = () => {
    setMessages(INITIAL_AURA_MESSAGES);
    try {
      localStorage.removeItem('dear_diary_aura_chat_v1');
    } catch (e) {}
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-xl mx-auto pb-20 animate-fadeIn">
      {/* Top Aura Profile Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-400 via-rose-300 to-amber-200 flex items-center justify-center text-purple-900 shadow-sm animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
              Aura
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Empathetic Companion
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Always here • Non-judgmental & confidential
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={saveAsJournalEntry}
            title="Save this conversation as a diary entry"
            className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 transition"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Save as Entry</span>
          </button>
          <button
            onClick={clearChat}
            title="Start fresh conversation"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guided Journeys Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
        {GUIDED_JOURNEYS.map((gj) => {
          const Icon = gj.icon;
          return (
            <button
              key={gj.id}
              onClick={() => sendMessage(gj.starter)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-left transition shrink-0 shadow-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {gj.label}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {gj.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-300 to-rose-300 flex items-center justify-center text-purple-900 shrink-0 shadow-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-br-xs'
                    : 'bg-white/85 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                <span
                  className={`text-[9px] block mt-1 text-right ${
                    isUser ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs animate-pulse">
              Aura is reflecting with you...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what is on your heart today..."
            className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
