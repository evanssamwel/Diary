import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { Lock, Fingerprint, Delete, Shield, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PinLockModal: React.FC = () => {
  const { unlockApp, userProfile } = useDiary();
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const targetLength = userProfile.pinCode ? userProfile.pinCode.length : 4;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage('');

      // Auto-submit when length reached
      if (nextPin.length === (userProfile.pinCode?.length || 4)) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verify = (code: string) => {
    const success = unlockApp(code);
    if (!success) {
      setErrorShake(true);
      setErrorMessage('Incorrect passcode. Try again.');
      setTimeout(() => {
        setErrorShake(false);
        setPin('');
      }, 600);
    } else {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.5 },
      });
    }
  };

  const handleBiometric = () => {
    // Biometric simulated authentication
    if (userProfile.pinCode) {
      unlockApp(userProfile.pinCode);
      confetti({ particleCount: 20, spread: 40 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-fadeIn">
      <div
        className={`w-full max-w-sm bg-white/95 dark:bg-slate-900/95 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800 text-center transition-transform ${
          errorShake ? 'animate-bounce' : ''
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-purple-200 to-rose-200 dark:from-purple-900/50 dark:to-rose-900/50 flex items-center justify-center shadow-inner">
          <Lock className="w-7 h-7 text-purple-700 dark:text-purple-300" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Dear Diary
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Encrypted & Private Sanctuary
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: targetLength }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? 'bg-purple-600 dark:bg-purple-400 scale-110 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-500 font-medium mb-4 animate-pulse">
            {errorMessage}
          </p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xl font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-all shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBiometric}
            title="Biometric unlock (FaceID)"
            className="h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/40 active:scale-95 transition"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xl font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 active:scale-95 transition-all shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            title="Delete digit"
            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 active:scale-95 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Your thoughts never leave your private device.
        </p>
      </div>
    </div>
  );
};
