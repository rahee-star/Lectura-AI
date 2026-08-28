import React from 'react';
import {
  Sparkles,
  Mic,
  Upload,
  BookOpen,
  Brain,
  HelpCircle,
  PenTool,
  FolderKanban,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Volume2,
  ArrowRight,
  Target,
  Flame,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { UserProfile, StreakData } from '../types';
import { calculateWeeklyProgress } from '../services/storage';

interface LecturaWelcomeViewProps {
  userProfile: UserProfile | null;
  totalSavedLectures: number;
  streakData: StreakData | null;
  onOpenRecord: () => void;
  onOpenUpload: () => void;
  onOpenLibrary: () => void;
  onOpenGoalModal: () => void;
  onLoadSampleLectures: () => void;
}

export const LecturaWelcomeView: React.FC<LecturaWelcomeViewProps> = ({
  userProfile,
  totalSavedLectures,
  streakData,
  onOpenRecord,
  onOpenUpload,
  onOpenLibrary,
  onOpenGoalModal,
  onLoadSampleLectures,
}) => {
  const weeklyProgress = streakData ? calculateWeeklyProgress(streakData) : null;

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4 animate-fade-in">
      {/* Brand Hero Bento Card */}
      <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden text-center space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        {/* Glowing Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LECTURA AI Logo */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/20">
            <GraduationCap className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Title & Brand Name */}
        <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-950/80 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Academic Intelligence</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            LECTURA <span className="text-indigo-400">AI</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            {userProfile ? `Welcome, ${userProfile.name} (${userProfile.university})!` : 'Your Intelligent University Lecture Transcription & Mastery Engine.'}
            <br />
            Transform up to 3 hours of live lecture audio or uploaded notes into structured explanatory summaries, 20+ spaced repetition flashcards, and 30+ multiple-choice examination questions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 relative z-10">
          <button
            onClick={onOpenRecord}
            className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-red-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>+ Record 3-Hour Lecture</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Notes / Audio File</span>
          </button>

          <button
            onClick={onOpenLibrary}
            className="flex items-center space-x-2 px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-xs md:text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            <FolderKanban className="w-4 h-4 text-indigo-400" />
            <span>My Library ({totalSavedLectures})</span>
          </button>
        </div>
      </div>

      {/* Weekly Study Duration Goal & Active Streak Card */}
      {streakData && weeklyProgress && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 md:p-7 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Flame className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-100">Weekly Study Duration Goal</h3>
                  <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                    {streakData.count} Day Streak
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target: {formatHoursMinutes(weeklyProgress.targetMinutes)} across {weeklyProgress.targetDaysPerWeek} active study days
                </p>
              </div>
            </div>

            <button
              onClick={onOpenGoalModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Adjust Goal & View Details</span>
            </button>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Studied this week: <strong className="text-white font-bold">{formatHoursMinutes(weeklyProgress.studiedMinutesThisWeek)}</strong> ({weeklyProgress.percentComplete}% of target)
              </span>
              <span className="text-indigo-300 font-bold">
                {weeklyProgress.isGoalMet ? 'Goal Achieved 🎉' : `${formatHoursMinutes(weeklyProgress.remainingMinutes)} remaining`}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  weeklyProgress.isGoalMet
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, weeklyProgress.percentComplete))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feature Capabilities Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bento 1: Notes & Research */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Synthesized Explanatory Notes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executive summaries, deep accurate research, key doctrine points, case precedents, and simplified analogies without lecture tangents.
          </p>
        </div>

        {/* Bento 2: 20+ Flashcards & 30+ Quizzes */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">20+ Cards & 30+ Practice Quizzes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Spaced repetition flashcards with guiding clues (not direct spoilers), plus ready-made 30+ question examination test banks.
          </p>
        </div>

        {/* Bento 3: Smart Transcript & Essay Grading */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <PenTool className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Essay Grading & AI Tutor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instant 4-tier rubric evaluation with constructive feedback and continuous 24/7 AI tutor explanations for any concept.
          </p>
        </div>
      </div>

      {/* Quick Starter Helper */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>Need sample curriculum to explore?</span>
        </div>
        <button
          onClick={onLoadSampleLectures}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 transition-colors"
        >
          Load University Sample Notes (Tort Law, Medicine, CS, Economics)
        </button>
      </div>
    </div>
  );
};

