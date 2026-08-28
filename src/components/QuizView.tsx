import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Trophy,
  Plus,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';
import { generateExtraStudyItems } from '../services/api';

interface QuizViewProps {
  quizzes: QuizQuestion[];
  lectureTitle: string;
  onUpdateQuizzes: (updated: QuizQuestion[]) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quizzes,
  lectureTitle,
  onUpdateQuizzes,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [userScore, setUserScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

  const topics = ['all', ...Array.from(new Set(quizzes.map((q) => q.topicTag || 'General')))];

  const filteredQuizzes = quizzes.filter(
    (q) => selectedTopic === 'all' || (q.topicTag || 'General') === selectedTopic
  );

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuizzes.length - 1));
  const currentQ = filteredQuizzes[safeIndex] || quizzes[0];
  const selectedOption = selectedAnswers[safeIndex] !== undefined ? selectedAnswers[safeIndex] : null;
  const isAnswered = selectedOption !== null;

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;
    
    const isCorrect = index === currentQ.correctIndex;
    setSelectedAnswers((prev) => ({ ...prev, [safeIndex]: index }));
    
    if (isCorrect) {
      setUserScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (safeIndex + 1 < filteredQuizzes.length) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCompleted(true);
      if (userScore >= filteredQuizzes.length * 0.75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setUserScore(0);
    setCompleted(false);
  };

  const handleGenerateMoreQuizzes = async () => {
    setIsGenerating(true);
    try {
      const newItems = await generateExtraStudyItems({
        lectureTitle,
        type: 'quizzes',
        count: 4,
      });

      const formatted: QuizQuestion[] = newItems.map((item, idx) => ({
        id: `qz-gen-${Date.now()}-${idx}`,
        question: item.question,
        options: item.options || [],
        correctIndex: item.correctIndex ?? 0,
        explanation: item.explanation || 'No explanation provided.',
        topicTag: item.topicTag || 'General',
      }));

      onUpdateQuizzes([...quizzes, ...formatted]);
      alert(`Added ${formatted.length} new quiz questions!`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate extra quiz questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        No quiz questions available for this lecture.
      </div>
    );
  }

  if (completed) {
    const finalScore = userScore;
    const total = quizzes.length;
    const percentage = Math.round((finalScore / total) * 100);

    return (
      <div className="max-w-xl mx-auto p-8 bg-[#1E293B] border border-slate-700 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        <div className="w-16 h-16 mx-auto bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center shadow-md">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-100">Quiz Completed!</h3>
          <p className="text-sm text-slate-400 mt-1">
            You scored <strong className="text-emerald-400 font-bold">{finalScore}</strong> out of {total} ({percentage}%)
          </p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-slate-300 shadow-inner">
          {percentage >= 80 ? (
            <p className="text-emerald-300 font-bold">
              Outstanding comprehension! You have mastered the key legal definitions and tests from this lecture.
            </p>
          ) : percentage >= 50 ? (
            <p className="text-amber-300 font-bold">
              Good effort! Review the flashcards and key case summaries before testing yourself again.
            </p>
          ) : (
            <p className="text-rose-300 font-bold">
              Keep practicing! Re-read the lecture synthesis and study the Donoghue and Caparo framework cards.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={restartQuiz}
            className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={handleGenerateMoreQuizzes}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>+ AI Generate New Drill</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Topic Filter Bento Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-md">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-indigo-400 font-mono text-xs font-bold rounded-xl shadow-inner">
            Question {safeIndex + 1} of {filteredQuizzes.length}
          </span>
          <span className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl">
            {currentQ.topicTag || 'Lecture Concept'}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuestionGrid(!showQuestionGrid)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            {showQuestionGrid ? 'Hide Question Grid' : `View All Questions (${filteredQuizzes.length})`}
          </button>

          <div className="text-xs text-slate-300 font-bold px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl">
            Score: <span className="text-emerald-400">{userScore}</span> / {Object.keys(selectedAnswers).length}
          </div>
        </div>
      </div>

      {/* Question Number Grid Selector (for 30+ questions) */}
      {showQuestionGrid && (
        <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-inner animate-fade-in space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-bold text-slate-300">Jump to Question:</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span>Correct</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span>Incorrect</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /><span>Unanswered</span></span>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {filteredQuizzes.map((q, idx) => {
              const answered = selectedAnswers[idx] !== undefined;
              const isCorrect = answered && selectedAnswers[idx] === q.correctIndex;
              const isCurrent = idx === safeIndex;

              let btnClass = 'bg-slate-800 text-slate-400 border-slate-700';
              if (answered) {
                btnClass = isCorrect ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 font-bold' : 'bg-red-950 text-red-300 border-red-500/50 font-bold';
              }
              if (isCurrent) {
                btnClass += ' ring-2 ring-indigo-400 font-black';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowQuestionGrid(false);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Bento Card */}
      <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let optionStyle = 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600 text-slate-200 cursor-pointer';
            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-100 shadow-md';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-red-950/50 border-red-500 text-red-100';
              } else {
                optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-default';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-start justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </div>

                {isAnswered && (
                  <div className="shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {isAnswered && (
          <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs space-y-1.5 animate-fade-in shadow-inner">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explanation & Legal Rationale</span>
            </span>
            <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-xs cursor-pointer"
          >
            <span>{safeIndex + 1 === filteredQuizzes.length ? 'Finish & See Summary' : 'Next Question →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
