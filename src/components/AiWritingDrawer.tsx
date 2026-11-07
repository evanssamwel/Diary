import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  HelpCircle,
  FileText,
  HeartHandshake,
  Check,
  Copy,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { MoodType } from '../types';

interface Props {
  text: string;
  title: string;
  mood: MoodType;
  tags: string[];
  onApplyText: (newText: string) => void;
  onApplyAffirmation: (aff: string) => void;
  onClose: () => void;
}

export const AiWritingDrawer: React.FC<Props> = ({
  text,
  title,
  mood,
  tags,
  onApplyText,
  onApplyAffirmation,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<
    'expand' | 'rewrite' | 'questions' | 'summarize' | 'affirmation'
  >('expand');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const actions = [
    {
      id: 'expand',
      label: 'Help Expand',
      desc: 'Enrich with sensory details and depth',
      icon: Maximize2,
    },
    {
      id: 'rewrite',
      label: 'Gentle Polish',
      desc: 'Flow gracefully in your authentic voice',
      icon: Sparkles,
    },
    {
      id: 'questions',
      label: 'Reflect Deeper',
      desc: '3 gentle questions to explore feelings',
      icon: HelpCircle,
    },
    {
      id: 'summarize',
      label: 'Themes & Essence',
      desc: 'Emotional summary and core themes',
      icon: FileText,
    },
    {
      id: 'affirmation',
      label: 'Daily Affirmation',
      desc: 'Personalized affirmation for this entry',
      icon: HeartHandshake,
    },
  ] as const;

  const runAssistant = async (mode = activeMode) => {
    if (!text || text.trim().length === 0) {
      setError('Please write a sentence or thought in your entry first.');
      return;
    }
    setError('');
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai/writing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          text,
          title,
          mood,
          tags,
        }),
      });

      if (!res.ok) {
        throw new Error('Assistance request failed');
      }

      const data = await res.json();
      setResult(data.result);
    } catch (e: any) {
      setError(e.message || 'Could not reach AI assistant right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-rose-400 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 leading-tight">
                AI Reflection Assistant
              </h3>
              <p className="text-[11px] text-slate-400">
                Empathetic, voice-preserving guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action modes buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 overflow-x-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            const isSelected = activeMode === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setActiveMode(act.id);
                  runAssistant(act.id);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold leading-none">
                    {act.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {act.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-3 min-h-[160px]">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
              <p className="text-xs text-slate-500 animate-pulse font-medium">
                Listening to your heart and weaving reflections...
              </p>
            </div>
          ) : result ? (
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {result}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs">
                Select an option above to generate gentle reflection or refinement for this entry.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={() => runAssistant()}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {result && (activeMode === 'expand' || activeMode === 'rewrite') && (
              <button
                onClick={() => {
                  onApplyText(result);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Replace in Editor
              </button>
            )}

            {result && activeMode === 'affirmation' && (
              <button
                onClick={() => {
                  onApplyAffirmation(result);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Save as Affirmation
              </button>
            )}

            {!result && (
              <button
                onClick={() => runAssistant()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
