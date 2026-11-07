import React, { useState, useRef, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';
import { DiaryEntry, MoodType } from '../types';
import { MOODS } from '../utils/constants';
import { AiWritingDrawer } from './AiWritingDrawer';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Heart,
  Image,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Tag,
  Clock,
  Calendar,
  Smile,
  Sliders,
  Volume2,
  Check,
  X,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_PHOTOS = [
  { label: 'Morning Tea', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80' },
  { label: 'Lavender Petals', url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Rainy Window', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Warm Light', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
];

const POPULAR_TAGS = ['Gratitude', 'Reflections', 'SelfCare', 'Work', 'Dreams', 'Love', 'Nature', 'Creativity', 'Peace'];

export const JournalEditor: React.FC = () => {
  const {
    editingEntry,
    addEntry,
    updateEntry,
    deleteEntry,
    closeEntryEditor,
    setActiveTab,
    soundTrack,
    setSoundTrack,
  } = useDiary();

  const [title, setTitle] = useState(editingEntry?.title || '');
  const [content, setContent] = useState(editingEntry?.content || '');
  const [date, setDate] = useState(
    editingEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    editingEntry?.time ||
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [mood, setMood] = useState<MoodType>(editingEntry?.mood || 'peaceful');
  const [moodIntensity, setMoodIntensity] = useState<number>(
    editingEntry?.moodIntensity || 4
  );
  const [tags, setTags] = useState<string[]>(editingEntry?.tags || ['Reflections']);
  const [photos, setPhotos] = useState<string[]>(editingEntry?.photos || []);
  const [isFavorite, setIsFavorite] = useState(editingEntry?.isFavorite || false);
  const [isDraft, setIsDraft] = useState(editingEntry?.isDraft || false);
  const [aiAffirmation, setAiAffirmation] = useState(editingEntry?.aiAffirmation || '');

  // Modals & Drawers
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    editingEntry?.audioNote?.audioDataUrl || null
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync if editingEntry changes
  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setDate(editingEntry.date);
      setTime(editingEntry.time);
      setMood(editingEntry.mood);
      setMoodIntensity(editingEntry.moodIntensity || 4);
      setTags(editingEntry.tags);
      setPhotos(editingEntry.photos);
      setIsFavorite(editingEntry.isFavorite);
      setIsDraft(editingEntry.isDraft);
      setAiAffirmation(editingEntry.aiAffirmation || '');
      setAudioUrl(editingEntry.audioNote?.audioDataUrl || null);
    }
  }, [editingEntry]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      alert('Microphone access is needed to record a voice note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const deleteAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioUrl(null);
    setIsPlayingAudio(false);
  };

  // Transcribe recorded audio with Gemini
  const transcribeAudio = async () => {
    if (!audioUrl) return;
    setIsTranscribing(true);
    try {
      // Split base64 prefix
      const base64Data = audioUrl.split(',')[1];
      const res = await fetch('/api/ai/transcribe-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Audio: base64Data,
          mimeType: 'audio/webm',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          setContent((prev) => (prev ? prev + '\n\n' + data.transcript : data.transcript));
        }
      }
    } catch (e) {
      console.error('Transcription error', e);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addSamplePhoto = (url: string) => {
    setPhotos((prev) => [...prev, url]);
    setShowPhotoPicker(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Tags toggle
  const toggleTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter((t) => t !== tagName));
    } else {
      setTags([...tags, tagName]);
    }
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setCustomTagInput('');
  };

  // Save Handler
  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      alert('Please write something in your diary entry.');
      return;
    }

    const payload = {
      title: title.trim() || 'Untitled Moment',
      content: content.trim(),
      date,
      time,
      mood,
      moodIntensity,
      tags,
      photos,
      audioNote: audioUrl
        ? {
            durationSec: recordingSeconds,
            audioDataUrl: audioUrl,
          }
        : undefined,
      isFavorite,
      isDraft,
      aiAffirmation,
    };

    if (editingEntry && editingEntry.id) {
      updateEntry(editingEntry.id, payload);
    } else {
      addEntry(payload);
    }

    closeEntryEditor();
    setActiveTab('home');
  };

  const currentMoodMeta = MOODS[mood] || MOODS.peaceful;

  return (
    <div className="pb-28 max-w-xl mx-auto animate-fadeIn">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between py-3 mb-2 sticky top-14 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-1 rounded-2xl">
        <button
          onClick={() => {
            closeEntryEditor();
            setActiveTab('home');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-xl transition ${
              isFavorite
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Mark as favorite memory"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          {/* AI Writing Assistant Button */}
          <button
            onClick={() => setShowAiDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-semibold transition border border-purple-200/80 dark:border-purple-800"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assist</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{editingEntry?.id ? 'Update' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas Card */}
      <div className="bg-white/80 dark:bg-slate-900/85 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-4">
        {/* Mood & Date Pills Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Mood selector button */}
            <button
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition shadow-xs ${currentMoodMeta.bgSoft}`}
            >
              <span>{currentMoodMeta.emoji}</span>
              <span>{currentMoodMeta.label}</span>
              <span className="text-[10px] opacity-70">
                {'★'.repeat(moodIntensity)}
              </span>
            </button>

            {/* Date input */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time display */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent focus:outline-none text-[11px] font-medium"
              />
            </div>

            {/* Draft toggle */}
            <button
              onClick={() => setIsDraft(!isDraft)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition ${
                isDraft
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isDraft ? 'Draft' : 'Private'}
            </button>
          </div>
        </div>

        {/* Mood Picker Dropdown */}
        {showMoodPicker && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose Feeling & Intensity
              </span>
              <button
                onClick={() => setShowMoodPicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(Object.keys(MOODS) as MoodType[]).map((mKey) => {
                const m = MOODS[mKey];
                const active = mood === mKey;
                return (
                  <button
                    key={mKey}
                    onClick={() => setMood(mKey)}
                    className={`p-2 rounded-xl border flex flex-col items-center transition ${
                      active
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{m.emoji}</span>
                    <span className="text-[10px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Intensity slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Feeling Depth:</span>
                <span className="font-semibold text-purple-600">
                  {moodIntensity}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this memory or thought..."
            className="w-full font-serif font-bold text-xl sm:text-2xl bg-transparent border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 leading-tight"
          />
        </div>

        {/* Content Area */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dear Diary, today my thoughts are wandering toward..."
            rows={12}
            className="w-full bg-transparent border-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none font-sans text-sm sm:text-base leading-relaxed"
          />
        </div>

        {/* AI Affirmation Pill (if generated) */}
        {aiAffirmation && (
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block text-purple-700 dark:text-purple-400">
                Personal Affirmation
              </span>
              <p className="italic font-serif text-sm mt-0.5 leading-snug">
                "{aiAffirmation}"
              </p>
            </div>
            <button
              onClick={() => setAiAffirmation('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Voice Note Player & Recording Area */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {isRecording ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Recording audio ({recordingSeconds}s)... Speak freely
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
              >
                <Square className="w-3 h-3 fill-white" /> Stop
              </button>
            </div>
          ) : audioUrl ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayAudio}
                  className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Voice Note Attached
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Spoken audio reflection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranscribing ? 'Transcribing...' : 'AI Transcribe'}</span>
                </button>
                <button
                  onClick={deleteAudio}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove audio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Photo Gallery in Editor */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Photos & Moments ({photos.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {photos.map((src, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700 group shadow-xs"
                >
                  <img
                    src={src}
                    alt="Memory"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media & Tags Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Record mic */}
            {!audioUrl && !isRecording && (
              <button
                onClick={startRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
                title="Record voice note"
              >
                <Mic className="w-3.5 h-3.5 text-purple-600" />
                <span>Voice Note</span>
              </button>
            )}

            {/* Add Photo */}
            <button
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
            >
              <Image className="w-3.5 h-3.5 text-rose-500" />
              <span>Add Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-[11px] text-slate-400">
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Photo Picker Modal */}
        {showPhotoPicker && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attach a Photo
              </span>
              <button
                onClick={() => setShowPhotoPicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-purple-400 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition text-center"
              >
                📁 Upload from Device
              </button>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 mb-2">Or choose a peaceful moment snapshot:</p>
              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_PHOTOS.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => addSamplePhoto(sp.url)}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-purple-500 transition group relative"
                  >
                    <img src={sp.url} alt={sp.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white font-medium p-0.5 text-center leading-tight">
                      {sp.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags & Topics</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map((t) => {
              const selected = tags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    selected
                      ? 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>

          {/* Custom Tag Add */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
              placeholder="Add custom tag (e.g. KyotoTrip)"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            <button
              onClick={addCustomTag}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Drawer Modal */}
      {showAiDrawer && (
        <AiWritingDrawer
          text={content}
          title={title}
          mood={mood}
          tags={tags}
          onApplyText={(newText) => setContent(newText)}
          onApplyAffirmation={(aff) => setAiAffirmation(aff)}
          onClose={() => setShowAiDrawer(false)}
        />
      )}
    </div>
  );
};
