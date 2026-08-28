import React from 'react';
import {
  Mic,
  BookOpen,
  Sparkles,
  FolderKanban,
  Plus,
  Flame,
  Star,
  User,
  GraduationCap,
  LogOut,
  Target,
} from 'lucide-react';
import { LectureNote, UserProfile, StreakData } from '../types';
import { calculateWeeklyProgress } from '../services/storage';

interface HeaderProps {
  activeLecture: LectureNote | null;
  userProfile: UserProfile | null;
  streakData: StreakData | null;
  onOpenNewModal: () => void;
  onOpenDrawer: () => void;
  onOpenFeedback: () => void;
  onOpenWelcome: () => void;
  onOpenLibraryTab: () => void;
  onOpenGoalModal: () => void;
  onLogout: () => void;
  totalSavedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLecture,
  userProfile,
  streakData,
  onOpenNewModal,
  onOpenDrawer,
  onOpenFeedback,
  onOpenWelcome,
  onOpenLibraryTab,
  onOpenGoalModal,
  onLogout,
  totalSavedCount,
}) => {
  const weeklyProgress = streakData ? calculateWeeklyProgress(streakData) : null;

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between gap-4 border-b border-slate-800">
      <div className="flex items-center justify-between w-full bg-[#1E293B] px-5 py-2.5 rounded-2xl border border-slate-700 shadow-xl">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWelcome}
            className="flex items-center space-x-2.5 group text-left cursor-pointer"
            title="Return to LECTURA AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  LECTURA <span className="text-indigo-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold uppercase tracking-wider rounded border border-indigo-500/30">
                  v2.0
                </span>
              </div>
            </div>
          </button>

          {/* Library Button */}
          <button
            onClick={onOpenLibraryTab}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-sm group cursor-pointer"
            title="Open saved lecture library"
          >
            <FolderKanban className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="hidden sm:inline">My Library</span>
            <span className="px-1.5 py-0.2 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 rounded-md text-[10px] font-mono">
              {totalSavedCount}
            </span>
          </button>
        </div>

        {/* Center Active Lecture Info */}
        {activeLecture && (
          <div className="hidden lg:flex flex-col items-center text-center max-w-sm truncate px-2">
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider truncate max-w-xs">
              {activeLecture.subject} • {activeLecture.lecturer}
            </span>
            <h2 className="text-xs font-bold text-slate-200 truncate w-full">
              {activeLecture.title}
            </h2>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Rate & Complaint Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all shadow-sm group cursor-pointer"
            title="Rate the app (1-5 stars) and submit complaints or feedback"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">Rate / Complaints</span>
          </button>

          {/* Weekly Study Duration Goal & Streak Tracker Button */}
          <button
            onClick={onOpenGoalModal}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/40 hover:border-indigo-500/60 rounded-xl text-xs text-amber-300 shadow-sm transition-all cursor-pointer group"
            title="View Weekly Study Duration Goal & Streak Progress"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-slate-100">{streakData?.count || 5}d</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <div className="hidden sm:flex items-center space-x-1 text-indigo-300 font-bold text-[11px]">
              <Target className="w-3 h-3 text-indigo-400" />
              <span>{weeklyProgress?.percentComplete ?? 70}% Goal</span>
            </div>
          </button>

          {/* User Profile Avatar / Logout */}
          {userProfile && (
            <div className="hidden sm:flex items-center space-x-2 pl-1 border-l border-slate-700">
              <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-200 font-bold max-w-[100px] truncate">{userProfile.name.split(' ')[0]}</span>
              </div>
            </div>
          )}

          {/* Record Lecture CTA */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Record</span>
          </button>
        </div>
      </div>
    </header>
  );
};

