import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  Brain,
  Plus,
  Loader2,
  AlertCircle,
  Lightbulb,
  Check,
} from 'lucide-react';
import { Flashcard } from '../types';
import { generateExtraStudyItems } from '../services/api';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  lectureTitle: string;
  onUpdateFlashcards: (updated: Flashcard[]) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  lectureTitle,
  onUpdateFlashcards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'review' | 'mastered' } | null>(null);

  const categories = ['all', ...Array.from(new Set(flashcards.map((f) => f.category || 'General')))];

  const filteredCards = flashcards.filter(
    (c) => filterCategory === 'all' || (c.category || 'General') === filterCategory
  );

  // Keep index within safe bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const activeCard = filteredCards[safeIndex] || flashcards[0];

  useEffect(() => {
    // Keyboard navigation shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space or enter flips the card
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, filteredCards.length]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleMastery = (status: 'learning' | 'mastered') => {
    if (!activeCard) return;
    const updated = flashcards.map((card) =>
      card.id === activeCard.id ? { ...card, masteryStatus: status } : card
    );
    onUpdateFlashcards(updated);

    setStatusNotification({
      message: status === 'mastered' ? 'Marked as Mastered! 🎉' : 'Marked for Review 📝',
      type: status,
    });
    setTimeout(() => setStatusNotification(null), 1500);

    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    onUpdateFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const newItems = await generateExtraStudyItems({
        lectureTitle,
        type: 'flashcards',
        count: 5,
      });

      const formatted: Flashcard[] = newItems.map((item, idx) => ({
        id: `fc-gen-${Date.now()}-${idx}`,
        question: item.question,
        answer: item.answer,
        hint: item.hint || `Focus on key doctrinal tests and core definitions related to ${lectureTitle}`,
        category: item.category || 'AI Generated',
        difficulty: item.difficulty || 'medium',
        masteryStatus: 'new',
      }));

      onUpdateFlashcards([...flashcards, ...formatted]);
      setStatusNotification({
        message: `Generated ${formatted.length} new flashcards!`,
        type: 'mastered',
      });
      setTimeout(() => setStatusNotification(null), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate extra flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const masteredCount = flashcards.filter((f) => f.masteryStatus === 'mastered').length;
  const learningCount = flashcards.filter((f) => f.masteryStatus === 'learning').length;
  const progressPercent = Math.round((masteredCount / (flashcards.length || 1)) * 100);

  if (filteredCards.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl space-y-3">
        <p>No flashcards found for category "{filterCategory}".</p>
        <button
          onClick={() => {
            setFilterCategory('all');
            setCurrentIndex(0);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
        >
          View All Flashcards
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header & Stats Bento Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Spaced Repetition Deck ({flashcards.length} Cards)</h3>
            <p className="text-xs text-slate-400">
              Mastered: <span className="text-emerald-400 font-bold">{masteredCount}</span> • Needs Review: <span className="text-amber-400 font-bold">{learningCount}</span> ({progressPercent}% mastery)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>+ AI Generate More</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCategory(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
              setShowHint(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all capitalize font-bold cursor-pointer ${
              filterCategory === cat
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Flashcard Component (Interactive Flip Card) */}
      <div
        id={`flashcard-${activeCard.id}`}
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[340px] bg-[#1E293B] border border-slate-700 hover:border-indigo-500/60 rounded-3xl p-8 cursor-pointer select-none shadow-2xl transition-all flex flex-col justify-between group overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-[11px] font-mono font-bold text-indigo-300">
              Card {safeIndex + 1} of {filteredCards.length}
            </span>
            {activeCard.masteryStatus === 'mastered' && (
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold rounded-lg text-[10px]">
                Mastered
              </span>
            )}
            {activeCard.masteryStatus === 'learning' && (
              <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold rounded-lg text-[10px]">
                Needs Review
              </span>
            )}
          </div>
          <span className="px-3 py-1 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold rounded-xl text-[11px]">
            {activeCard.category || 'Core Concept'}
          </span>
        </div>

        {/* Card Body */}
        <div className="py-6 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            {isFlipped ? 'Answer & Substantive Authority' : 'Question / Conceptual Inquiry'}
          </span>

          <p className="text-lg md:text-xl font-semibold text-slate-100 leading-relaxed px-2">
            {isFlipped ? activeCard.answer : activeCard.question}
          </p>

          {/* Guiding Hint (Does NOT show whole answer) */}
          {!isFlipped && showHint && activeCard.hint && (
            <div className="mt-4 p-3.5 bg-amber-950/50 border border-amber-500/40 rounded-2xl text-xs text-amber-200 inline-block text-left animate-fade-in shadow-md max-w-lg">
              <div className="flex items-center space-x-1.5 font-bold text-amber-400 mb-1">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Guiding Clue (Think About This):</span>
              </div>
              <p className="leading-relaxed">{activeCard.hint}</p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/80 text-xs text-slate-400">
          {!isFlipped ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(!showHint);
              }}
              className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-bold px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Clue' : 'Show Hint / Clue'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-400 font-bold">Answer Revealed</span>
          )}

          <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">
            Click anywhere or press Space to {isFlipped ? 'view question' : 'flip answer'}
          </span>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusNotification && (
        <div className="text-center animate-fade-in">
          <span className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${
            statusNotification.type === 'mastered'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
          }`}>
            <span>{statusNotification.message}</span>
          </span>
        </div>
      )}

      {/* Action Controls & Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          id="btn-flashcard-prev"
          onClick={handlePrev}
          className="flex items-center space-x-1.5 px-4 py-3 bg-[#1E293B] border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer font-bold text-xs"
          title="Previous card (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            id="btn-flashcard-review"
            onClick={() => handleMastery('learning')}
            className="px-5 py-2.5 bg-[#1E293B] border border-amber-500/40 hover:bg-amber-950/40 text-amber-300 text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5"
          >
            <span>Needs Review</span>
          </button>
          <button
            id="btn-flashcard-mastered"
            onClick={() => handleMastery('mastered')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mastered!</span>
          </button>
        </div>

        <button
          id="btn-flashcard-next"
          onClick={handleNext}
          className="flex items-center space-x-1.5 px-4 py-3 bg-[#1E293B] border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer font-bold text-xs"
          title="Next card (Right Arrow)"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
