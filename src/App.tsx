import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Brain,
  HelpCircle,
  PenTool,
  MessageSquare,
  Network,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  FolderKanban,
} from 'lucide-react';
import { LectureNote, Flashcard, QuizQuestion, EssaySubmission, ChatMessage, UserProfile, StreakData } from './types';
import {
  getSavedLectures,
  saveLecture,
  deleteLecture,
  resetToSamples,
  getUserProfile,
  saveUserProfile,
  logoutUserProfile,
  getStreakData,
  recordActiveDay,
  logStudyMinutes,
} from './services/storage';
import { Header } from './components/Header';
import { AudioPlayer } from './components/AudioPlayer';
import { NotesView } from './components/NotesView';
import { TranscriptView } from './components/TranscriptView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { EssayPracticeView } from './components/EssayPracticeView';
import { LectureChatView } from './components/LectureChatView';
import { MindMapView } from './components/MindMapView';
import { DeepResearchModal } from './components/DeepResearchModal';
import { NewLectureModal } from './components/NewLectureModal';
import { LectureListDrawer } from './components/LectureListDrawer';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginModal } from './components/LoginModal';
import { LecturaWelcomeView } from './components/LecturaWelcomeView';
import { MyLibraryView } from './components/MyLibraryView';
import { WeeklyGoalModal } from './components/WeeklyGoalModal';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [lectures, setLectures] = useState<LectureNote[]>([]);
  const [activeLecture, setActiveLecture] = useState<LectureNote | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'welcome' | 'library' | 'workspace'>('welcome');
  const [activeTab, setActiveTab] = useState<
    'notes' | 'transcript' | 'flashcards' | 'quiz' | 'essay' | 'chat' | 'mindmap'
  >('notes');

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [researchModalState, setResearchModalState] = useState<{
    isOpen: boolean;
    topic: string;
    context?: string;
  }>({
    isOpen: false,
    topic: '',
  });

  // Audio seeking
  const [currentSeekSeconds, setCurrentSeekSeconds] = useState<number>(0);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);

  useEffect(() => {
    // 1. Check User Profile
    const profile = getUserProfile();
    if (profile && profile.isAuthenticated) {
      setUserProfile(profile);
    } else {
      setShowLoginModal(true);
    }

    // 2. Load Streak
    const streak = recordActiveDay();
    setStreakData(streak);

    // 3. Load Lectures
    const loaded = getSavedLectures();
    setLectures(loaded);
    setActiveLecture(null);
    setCurrentViewMode('welcome');
  }, []);

  // Periodic active study timer (logs 1 minute of study every 60s when in active workspace)
  useEffect(() => {
    if (currentViewMode !== 'workspace' || !activeLecture) return;

    const interval = setInterval(() => {
      const updated = logStudyMinutes(1);
      setStreakData(updated);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentViewMode, activeLecture]);

  const handleLogin = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setShowLoginModal(false);
    const streak = recordActiveDay();
    setStreakData(streak);
  };

  const handleLogout = () => {
    logoutUserProfile();
    setUserProfile(null);
    setShowLoginModal(true);
  };

  const handleUpdateLecture = (updated: LectureNote) => {
    setActiveLecture(updated);
    saveLecture(updated);
    setLectures(getSavedLectures());
  };

  const handleCreateLecture = (newLecture: LectureNote) => {
    saveLecture(newLecture);
    const updatedList = getSavedLectures();
    setLectures(updatedList);
    setActiveLecture(newLecture);
    setCurrentViewMode('workspace');
    setActiveTab('notes');
  };

  const handleDeleteLecture = (id: string) => {
    const updatedList = deleteLecture(id);
    setLectures(updatedList);
    if (activeLecture?.id === id) {
      const next = updatedList[0] || null;
      setActiveLecture(next);
      if (!next) {
        setCurrentViewMode('welcome');
      }
    }
  };

  const handleSelectLectureFromLibrary = (lecture: LectureNote) => {
    setActiveLecture(lecture);
    setCurrentViewMode('workspace');
    setActiveTab('notes');
  };

  const handleOpenResearch = (topic: string, context?: string) => {
    setResearchModalState({
      isOpen: true,
      topic,
      context,
    });
  };

  const handleSeekAudio = (seconds: number) => {
    setCurrentSeekSeconds(seconds);
  };

  const handleLoadSampleCurriculum = () => {
    const samples = resetToSamples();
    setLectures(samples);
    setActiveLecture(samples[0]);
    setCurrentViewMode('workspace');
    setActiveTab('notes');
  };

  const navTabs: Array<{ id: string; label: string; icon: any; count?: number }> = activeLecture
    ? [
        { id: 'notes', label: 'Synthesized Notes', icon: BookOpen, count: activeLecture.notes.keyTopics.length },
        { id: 'transcript', label: 'Smart Transcript', icon: FileText, count: activeLecture.transcript.length },
        { id: 'flashcards', label: 'Flashcards', icon: Brain, count: activeLecture.flashcards.length },
        { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle, count: activeLecture.quizzes.length },
        { id: 'essay', label: 'Essay Grading', icon: PenTool, count: activeLecture.essayQuestions.length },
        { id: 'chat', label: 'AI Tutor', icon: MessageSquare },
        { id: 'mindmap', label: 'Mind Map', icon: Network },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header with LECTURA AI Brand, Streak, & Library Button */}
      <Header
        activeLecture={currentViewMode === 'workspace' ? activeLecture : null}
        userProfile={userProfile}
        streakData={streakData}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenWelcome={() => setCurrentViewMode('welcome')}
        onOpenLibraryTab={() => setCurrentViewMode('library')}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onLogout={handleLogout}
        totalSavedCount={lectures.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* VIEW 1: Welcome & Logo State (when no notes or home clicked) */}
        {currentViewMode === 'welcome' && (
          <LecturaWelcomeView
            userProfile={userProfile}
            totalSavedLectures={lectures.length}
            streakData={streakData}
            onOpenRecord={() => setIsNewModalOpen(true)}
            onOpenUpload={() => setIsNewModalOpen(true)}
            onOpenLibrary={() => setCurrentViewMode('library')}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
            onLoadSampleLectures={handleLoadSampleCurriculum}
          />
        )}

        {/* VIEW 2: My Library */}
        {currentViewMode === 'library' && (
          <MyLibraryView
            lectures={lectures}
            activeLectureId={activeLecture?.id || null}
            streakData={streakData}
            onSelectLecture={handleSelectLectureFromLibrary}
            onDeleteLecture={handleDeleteLecture}
            onOpenRecordModal={() => setIsNewModalOpen(true)}
            onOpenUploadModal={() => setIsNewModalOpen(true)}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        )}

        {/* VIEW 3: Active Workspace (when a lecture is active) */}
        {currentViewMode === 'workspace' && activeLecture && (
          <div className="space-y-6 animate-fade-in">
            {/* Lecture Hero Bento Card & Audio Player */}
            <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl uppercase tracking-wider">
                      {activeLecture.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Lecturer: <strong className="text-slate-200">{activeLecture.lecturer}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{activeLecture.date}</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
                    {activeLecture.title}
                  </h1>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentViewMode('library')}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-all shadow-md"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Library</span>
                  </button>
                  <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 shadow-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">Master Study Deck</span>
                  </div>
                </div>
              </div>

              {/* Persistent Audio Player */}
              <AudioPlayer
                audioSrc={activeLecture.audioBlobUrl || activeLecture.audioBase64}
                durationSeconds={activeLecture.durationSeconds}
                currentSeekTime={currentSeekSeconds}
                onTimeUpdate={(sec) => setPlaybackSeconds(sec)}
              />
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                        : 'bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                          isActive ? 'bg-indigo-700 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Views */}
            <div className="pt-2">
              {activeTab === 'notes' && (
                <NotesView
                  lecture={activeLecture}
                  onOpenResearch={handleOpenResearch}
                  onSeekAudio={handleSeekAudio}
                />
              )}

              {activeTab === 'transcript' && (
                <TranscriptView
                  transcript={activeLecture.transcript}
                  onSeekAudio={handleSeekAudio}
                  currentPlaybackSeconds={playbackSeconds}
                  onUpdateTranscriptSegment={(segId, newText) => {
                    const updatedTranscript = activeLecture.transcript.map((seg) =>
                      seg.id === segId ? { ...seg, text: newText } : seg
                    );
                    handleUpdateLecture({ ...activeLecture, transcript: updatedTranscript });
                  }}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardsView
                  flashcards={activeLecture.flashcards}
                  lectureTitle={activeLecture.title}
                  onUpdateFlashcards={(updated) =>
                    handleUpdateLecture({ ...activeLecture, flashcards: updated })
                  }
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView
                  quizzes={activeLecture.quizzes}
                  lectureTitle={activeLecture.title}
                  onUpdateQuizzes={(updated) =>
                    handleUpdateLecture({ ...activeLecture, quizzes: updated })
                  }
                />
              )}

              {activeTab === 'essay' && (
                <EssayPracticeView
                  essayQuestions={activeLecture.essayQuestions}
                  submissions={activeLecture.essaySubmissions}
                  onAddSubmission={(sub) =>
                    handleUpdateLecture({
                      ...activeLecture,
                      essaySubmissions: [...activeLecture.essaySubmissions, sub],
                    })
                  }
                />
              )}

              {activeTab === 'chat' && (
                <LectureChatView
                  lecture={activeLecture}
                  onUpdateChatHistory={(history) =>
                    handleUpdateLecture({ ...activeLecture, chatHistory: history })
                  }
                />
              )}

              {activeTab === 'mindmap' && (
                <MindMapView
                  nodes={activeLecture.notes.mindMapNodes}
                  onSelectConcept={(concept) => handleOpenResearch(concept)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Deep Research Modal */}
      {activeLecture && (
        <DeepResearchModal
          isOpen={researchModalState.isOpen}
          onClose={() => setResearchModalState((prev) => ({ ...prev, isOpen: false }))}
          topic={researchModalState.topic}
          context={researchModalState.context}
          subject={activeLecture.subject}
        />
      )}

      {/* Record / Import New Lecture Modal */}
      <NewLectureModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onLectureCreated={handleCreateLecture}
      />

      {/* Saved Lecture Library Drawer */}
      <LectureListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lectures={lectures}
        activeLectureId={activeLecture?.id || null}
        onSelectLecture={(lecture) => {
          setActiveLecture(lecture);
          setCurrentViewMode('workspace');
        }}
        onDeleteLecture={handleDeleteLecture}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      {/* User Feedback & Rating Modal (1-5 Stars + Complaints) */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Weekly Study Duration Goal & Streak Tracker Modal */}
      {streakData && (
        <WeeklyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          streakData={streakData}
          onUpdateStreakData={(updated) => setStreakData(updated)}
        />
      )}

      {/* Student Login / Profile Authentication Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
      />
    </div>
  );
}
