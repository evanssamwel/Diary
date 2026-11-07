import React from 'react';
import { useDiary } from '../context/DiaryContext';
import {
  Home,
  BookOpen,
  Calendar,
  Sparkles,
  BarChart2,
  User,
  Heart,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, activeTheme } = useDiary();

  interface NavItem {
    id: 'home' | 'journal' | 'aura' | 'calendar' | 'insights' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    special?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'aura', label: 'Aura AI', icon: Sparkles, special: true },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.special) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative -top-2.5 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-tr from-purple-500 via-rose-400 to-amber-300 text-white shadow-purple-500/30 scale-105 ring-2 ring-purple-300'
                      : 'bg-gradient-to-tr from-purple-400 to-rose-300 text-purple-950 opacity-90 hover:opacity-100 shadow-purple-400/20'
                  }`}
                >
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-semibold transition-colors ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-purple-700 dark:text-purple-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-950/60 scale-110'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
