import React, { useState } from 'react';
import {
  Target,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  Sliders,
  Plus,
  Zap,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StreakData, WeeklyGoalProgress } from '../types';
import { calculateWeeklyProgress, updateWeeklyGoal, logStudyMinutes } from '../services/storage';

interface WeeklyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: StreakData;
  onUpdateStreakData: (updated: StreakData) => void;
}

const PRESET_GOALS = [
  { label: 'Light Review', hours: 2.5, minutes: 150, days: 3, desc: '30 mins / 3 days a week' },
  { label: 'Standard Pace', hours: 5.0, minutes: 300, days: 5, desc: '1 hour / 5 days a week' },
  { label: 'Deep Mastery', hours: 8.0, minutes: 480, days: 6, desc: '1.3 hours / 6 days a week' },
  { label: 'Exam Sprint', hours: 12.0, minutes: 720, days: 7, desc: '1.7 hours daily crunch' },
];

export const WeeklyGoalModal: React.FC<WeeklyGoalModalProps> = ({
  isOpen,
  onClose,
  streakData,
  onUpdateStreakData,
}) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'settings' | 'log'>('progress');
  const [customHours, setCustomHours] = useState<number>(
    (streakData.weeklyGoalMinutes || 300) / 60
  );
  const [customDays, setCustomDays] = useState<number>(streakData.targetDaysPerWeek || 5);
  const [logMinutesInput, setLogMinutesInput] = useState<number>(30);
  const [logActivityName, setLogActivityName] = useState<string>('Lecture Audio & Flashcards');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const progress: WeeklyGoalProgress = calculateWeeklyProgress(streakData);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveGoal = (targetMinutes: number, targetDays: number) => {
    const updated = updateWeeklyGoal(targetMinutes, targetDays);
    onUpdateStreakData(updated);
    showToast(`Weekly goal updated to ${(targetMinutes / 60).toFixed(1)} hours across ${targetDays} days!`);
    setActiveTab('progress');
  };

  const handleApplyPreset = (preset: (typeof PRESET_GOALS)[0]) => {
    setCustomHours(preset.hours);
    setCustomDays(preset.days);
    handleSaveGoal(preset.minutes, preset.days);
  };

  const handleLogManualMinutes = () => {
    if (logMinutesInput <= 0) return;
    const updated = logStudyMinutes(logMinutesInput, logActivityName);
    onUpdateStreakData(updated);
    showToast(`Logged +${logMinutesInput} study minutes successfully!`);
    setActiveTab('progress');
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  // Find max minutes for charting scale
  const maxDayMinutes = Math.max(...progress.dailyBreakdown.map((d) => d.minutes), 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-5 md:p-6 border-b border-slate-750 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-100">Weekly Study Goal & Progress</h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded-full text-[10px] font-bold">
                  <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{streakData.count} Day Streak</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track your active study hours and stay accountable to your academic targets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast alert notification */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-700/80 px-6 py-2 text-xs text-emerald-300 font-bold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-4 pb-2 border-b border-slate-800 bg-[#1E293B]">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekly Progress</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Set Weekly Goal</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Study Minutes</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-none">
          {/* TAB 1: WEEKLY PROGRESS */}
          {activeTab === 'progress' && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Progress Card */}
              <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      Current Week Target
                    </span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-3xl font-black text-white">
                        {formatHoursMinutes(progress.studiedMinutesThisWeek)}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">
                        / {formatHoursMinutes(progress.targetMinutes)} goal
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-black ${
                        progress.isGoalMet
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {progress.isGoalMet ? <Trophy className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5" />}
                      <span>{progress.percentComplete}% Complete</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {progress.isGoalMet
                        ? '🎉 Weekly Goal Reached!'
                        : `${formatHoursMinutes(progress.remainingMinutes)} remaining`}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress.isGoalMet
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 shadow-md shadow-indigo-500/30'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, progress.percentComplete))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>0h</span>
                    <span>
                      Active Days: <strong className="text-slate-200">{progress.activeDaysThisWeek}</strong> / {progress.targetDaysPerWeek} days
                    </span>
                    <span>{formatHoursMinutes(progress.targetMinutes)}</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Weekly Breakdown Chart */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Daily Study Breakdown (This Week)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total: {progress.studiedMinutesThisWeek} mins
                  </span>
                </div>

                {/* Vertical bars */}
                <div className="grid grid-cols-7 gap-2 pt-2 items-end min-h-[110px]">
                  {progress.dailyBreakdown.map((day) => {
                    const heightPercent = maxDayMinutes > 0 ? (day.minutes / maxDayMinutes) * 100 : 0;
                    return (
                      <div key={day.date} className="flex flex-col items-center space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {day.minutes > 0 ? `${day.minutes}m` : '-'}
                        </span>
                        <div className="w-full max-w-[28px] h-20 bg-slate-950 rounded-xl flex items-end p-0.5 border border-slate-800">
                          <div
                            className={`w-full rounded-lg transition-all duration-500 ${
                              day.isToday
                                ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50'
                                : day.minutes > 0
                                ? 'bg-indigo-600/70'
                                : 'bg-transparent'
                            }`}
                            style={{ height: `${Math.max(day.minutes > 0 ? 15 : 0, heightPercent)}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <span
                            className={`text-[11px] font-bold block ${
                              day.isToday ? 'text-indigo-400 underline decoration-2' : 'text-slate-400'
                            }`}
                          >
                            {day.dayName}
                          </span>
                          <span className="text-[9px] text-slate-500 block">{day.shortDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-indigo-950/25 border border-indigo-500/30 rounded-2xl">
                <div className="flex items-center space-x-2.5">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Continuous Study Streak</h5>
                    <p className="text-[11px] text-slate-400">
                      You've studied on {streakData.count} active days in a row!
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('log')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    + Log Time
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Edit Goal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOAL CONFIGURATION & PRESETS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              {/* Preset Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Choose a Recommended Study Goal Preset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_GOALS.map((preset) => {
                    const isSelected = streakData.weeklyGoalMinutes === preset.minutes;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-900/70 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-100">{preset.label}</span>
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-[10px] font-mono font-bold">
                            {preset.hours} hrs/wk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Goal Sliders */}
              <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-inner">
                <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Or Customize Target Study Duration</span>
                </h4>

                {/* Hours Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Target Weekly Duration:</span>
                    <span className="font-black text-indigo-400 font-mono text-sm">
                      {customHours.toFixed(1)} Hours ({Math.round(customHours * 60)} Mins)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={customHours}
                    onChange={(e) => setCustomHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 hr / week</span>
                    <span>12.5 hrs / week</span>
                    <span>25 hrs / week</span>
                  </div>
                </div>

                {/* Target Days Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Target Active Days per Week:</span>
                    <span className="font-black text-indigo-400 font-mono text-sm">
                      {customDays} Days / Week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 day</span>
                    <span>3 days</span>
                    <span>5 days (Standard)</span>
                    <span>7 days</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveGoal(Math.round(customHours * 60), customDays)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Save Custom Weekly Goal ({customHours.toFixed(1)} Hours / {customDays} Days)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LOG STUDY MINUTES MANUALLY */}
          {activeTab === 'log' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Log Extra Study & Revision Time</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Studied offline, reviewed printed notes, or read academic textbooks? Add your study time to count towards your weekly goal and maintain your streak.
                  </p>
                </div>

                {/* Quick Minute Increments */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">Quick Minute Additions:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setLogMinutesInput(mins)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          logMinutesInput === mins
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        +{mins} mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Minutes Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">Custom Duration (Minutes):</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={logMinutesInput}
                    onChange={(e) => setLogMinutesInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Activity Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">Study Activity Focus:</label>
                  <select
                    value={logActivityName}
                    onChange={(e) => setLogActivityName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Lecture Audio & Flashcards">Lecture Audio & Flashcards</option>
                    <option value="Practice Examination Quizzes">Practice Examination Quizzes</option>
                    <option value="Textbook & Case Reading">Textbook & Case Law Reading</option>
                    <option value="Synthesized Notes Review">Synthesized Notes Revision</option>
                    <option value="Essay Practice & Writing">Essay Practice & Writing</option>
                    <option value="General Academic Study">General Academic Study</option>
                  </select>
                </div>

                <button
                  onClick={handleLogManualMinutes}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log +{logMinutesInput} Minutes to Weekly Progress</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automatic tracking counts audio playback & quiz time</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
