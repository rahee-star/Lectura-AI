import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  BookOpen,
  Brain,
  HelpCircle,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  Mic,
  Upload,
  User,
  Flame,
  Target,
  FileText,
  FileCode,
  PenTool,
  MessageSquare,
} from 'lucide-react';
import { LectureNote, StreakData } from '../types';
import { calculateWeeklyProgress } from '../services/storage';
import { exportLectureToPDF, exportLectureToMarkdown } from '../services/exportService';

interface MyLibraryViewProps {
  lectures: LectureNote[];
  activeLectureId: string | null;
  streakData?: StreakData | null;
  onSelectLecture: (lecture: LectureNote) => void;
  onDeleteLecture: (id: string) => void;
  onOpenRecordModal: () => void;
  onOpenUploadModal: () => void;
  onOpenGoalModal?: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  lectures,
  activeLectureId,
  streakData,
  onSelectLecture,
  onDeleteLecture,
  onOpenRecordModal,
  onOpenUploadModal,
  onOpenGoalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const weeklyProgress = streakData ? calculateWeeklyProgress(streakData) : null;

  const subjects = ['all', ...Array.from(new Set(lectures.map((l) => l.subject || 'General')))];

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch =
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || lecture.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins} mins`;
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Top Header Bento Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">My Lecture Library</h1>
            <p className="text-xs text-slate-400">
              All your recorded lectures and uploaded study notes are saved here. Click any lecture to resume studying.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {streakData && onOpenGoalModal && (
            <button
              onClick={onOpenGoalModal}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="View Weekly Study Goal"
            >
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{streakData.count}d Streak</span>
            </button>
          )}

          <button
            onClick={onOpenRecordModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>+ Record Lecture</span>
          </button>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>
        </div>
      </div>

      {/* Weekly Goal Quick Bar if available */}
      {streakData && weeklyProgress && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <Target className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-slate-300 font-medium">
                Weekly Target: <strong>{formatHoursMinutes(weeklyProgress.studiedMinutesThisWeek)}</strong> / {formatHoursMinutes(weeklyProgress.targetMinutes)} ({weeklyProgress.percentComplete}%)
              </span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-400">{weeklyProgress.activeDaysThisWeek} of {weeklyProgress.targetDaysPerWeek} days active</span>
            </div>
          </div>

          <button
            onClick={onOpenGoalModal}
            className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>Goal Tracker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Subject Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved lectures by title, professor, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        {/* Subject dropdown or pills */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub === 'all' ? 'All Subjects / Courses' : sub}
            </option>
          ))}
        </select>
      </div>

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="p-12 text-center bg-[#1E293B] border border-slate-700 rounded-3xl space-y-4 shadow-xl">
          <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">No lectures found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try adjusting your search query or subject filter.' : 'Record a new lecture or upload your notes to start building your library.'}
            </p>
          </div>
          <button
            onClick={onOpenRecordModal}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
          >
            + Record First Lecture
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLectures.map((lecture) => {
            const isActive = lecture.id === activeLectureId;
            return (
              <div
                key={lecture.id}
                onClick={() => onSelectLecture(lecture)}
                className={`relative bg-[#1E293B] border rounded-3xl p-6 transition-all cursor-pointer select-none shadow-xl flex flex-col justify-between group hover:border-indigo-500/60 ${
                  isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-800/60' : 'border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Subject & Actions Bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-lg truncate max-w-[160px]">
                      {lecture.subject}
                    </span>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => exportLectureToMarkdown(lecture)}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Download Markdown (.md)"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => exportLectureToPDF(lecture)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Download PDF Document (.pdf)"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${lecture.title}" from your library?`)) {
                            onDeleteLecture(lecture.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete lecture from library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Lecturer */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {lecture.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{lecture.lecturer}</span>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lecture.notes.executiveSummary}
                  </p>

                  {/* Badges / Stats */}
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-lg font-medium">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{formatDuration(lecture.durationSeconds)}</span>
                    </span>
                    <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-lg font-medium">
                      <BookOpen className="w-3 h-3 text-sky-400" />
                      <span>{lecture.notes.keyTopics?.length || 0} Modules</span>
                    </span>
                    <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-lg font-medium">
                      <Brain className="w-3 h-3 text-indigo-400" />
                      <span>{lecture.flashcards?.length || 0} Flashcards</span>
                    </span>
                    <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-lg font-medium">
                      <HelpCircle className="w-3 h-3 text-emerald-400" />
                      <span>{lecture.quizzes?.length || 0} Quizzes</span>
                    </span>
                    {lecture.essaySubmissions && lecture.essaySubmissions.length > 0 && (
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-purple-950/50 border border-purple-500/30 text-purple-300 rounded-lg font-medium">
                        <PenTool className="w-3 h-3 text-purple-400" />
                        <span>{lecture.essaySubmissions.length} Graded</span>
                      </span>
                    )}
                    {lecture.chatHistory && lecture.chatHistory.length > 0 && (
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 rounded-lg font-medium">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        <span>{lecture.chatHistory.length} Q&A</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-700/70 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{lecture.date}</span>
                  </span>

                  <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Open Study Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
