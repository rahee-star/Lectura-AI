import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Trash2,
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  FolderKanban,
  Sparkles,
  Star,
} from 'lucide-react';
import { LectureNote } from '../types';

interface LectureListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lectures: LectureNote[];
  activeLectureId: string;
  onSelectLecture: (lecture: LectureNote) => void;
  onDeleteLecture: (id: string) => void;
  onOpenNewModal: () => void;
  onOpenFeedback?: () => void;
}

export const LectureListDrawer: React.FC<LectureListDrawerProps> = ({
  isOpen,
  onClose,
  lectures,
  activeLectureId,
  onSelectLecture,
  onDeleteLecture,
  onOpenNewModal,
  onOpenFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  if (!isOpen) return null;

  const subjects = ['all', ...Array.from(new Set(lectures.map((l) => l.subject)))];

  const filteredLectures = lectures.filter((l) => {
    if (selectedSubject !== 'all' && l.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.lecturer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#1E293B] border-l border-slate-700 h-full flex flex-col shadow-2xl text-slate-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Your Lecture Library</h3>
              <p className="text-xs text-slate-400">{lectures.length} Total Saved Recordings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        <div className="p-4 border-b border-slate-700/80">
          <button
            onClick={() => {
              onClose();
              onOpenNewModal();
            }}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record / Import New Lecture</span>
          </button>
        </div>

        {/* Search and Subject Filter */}
        <div className="p-4 space-y-3 border-b border-slate-700/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lectures, subjects, or professors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all ${
                  selectedSubject === sub
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub === 'all' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>
        </div>

        {/* Lecture List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredLectures.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching lecture recordings found.
            </div>
          ) : (
            filteredLectures.map((item) => {
              const isActive = item.id === activeLectureId;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectLecture(item);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between shadow-sm ${
                    isActive
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] text-indigo-400 font-bold px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                      {item.subject}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete lecture "${item.title}"?`)) {
                          onDeleteLecture(item.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Lecture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-slate-200 group-hover:text-indigo-300 leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{item.date}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDuration(item.durationSeconds)}</span>
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Feedback / Star rating */}
        {onOpenFeedback && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/60">
            <button
              onClick={() => {
                onClose();
                onOpenFeedback();
              }}
              className="w-full py-2.5 px-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Rate App & Submit Complaints</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
