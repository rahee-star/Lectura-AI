import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Send,
} from 'lucide-react';
import { EssayQuestion, EssaySubmission } from '../types';
import { gradeStudentEssay } from '../services/api';

interface EssayPracticeViewProps {
  essayQuestions: EssayQuestion[];
  submissions: EssaySubmission[];
  onAddSubmission: (submission: EssaySubmission) => void;
}

export const EssayPracticeView: React.FC<EssayPracticeViewProps> = ({
  essayQuestions,
  submissions,
  onAddSubmission,
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showExpectedCriteria, setShowExpectedCriteria] = useState(false);

  const currentQ = essayQuestions[selectedQuestionIndex] || essayQuestions[0];
  const questionSubmissions = submissions.filter((s) => s.questionId === currentQ?.id);
  const latestSubmission = questionSubmissions[questionSubmissions.length - 1];

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0;

  const handleSubmitEssay = async () => {
    if (!studentAnswer.trim() || !currentQ) return;
    setIsGrading(true);
    try {
      const evaluation = await gradeStudentEssay({
        prompt: currentQ.prompt,
        studentAnswer,
        keyPointsExpected: currentQ.keyPointsExpected,
        modelAnswer: currentQ.modelAnswer,
      });

      const newSubmission: EssaySubmission = {
        id: `sub-${Date.now()}`,
        questionId: currentQ.id,
        studentAnswer,
        submittedAt: new Date().toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score: evaluation.score,
        rubricFeedback: evaluation.rubricFeedback,
        overallFeedback: evaluation.overallFeedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      };

      onAddSubmission(newSubmission);
    } catch (err: any) {
      console.error('Error grading essay:', err);
      alert(err.message || 'Failed to grade essay.');
    } finally {
      setIsGrading(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        No essay prompts available for this lecture.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Question Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {essayQuestions.map((eq, idx) => (
          <button
            key={eq.id}
            onClick={() => {
              setSelectedQuestionIndex(idx);
              setStudentAnswer('');
              setShowModelAnswer(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedQuestionIndex === idx
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Essay Prompt 0{idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Prompt Bento Card */}
      <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl space-y-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
          <span>University Level Exam Practice</span>
          <span className="px-2.5 py-0.5 bg-indigo-950/80 border border-indigo-500/30 rounded-lg text-indigo-300">Exam Rubric: 100 Marks</span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
          {currentQ.prompt}
        </h3>

        {currentQ.contextHint && (
          <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-slate-300 shadow-inner">
            <span className="font-bold text-amber-400 block mb-1">Guidance & Context:</span>
            {currentQ.contextHint}
          </div>
        )}

        {/* Expected Criteria Toggle */}
        <div className="border-t border-slate-700/80 pt-3">
          <button
            onClick={() => setShowExpectedCriteria(!showExpectedCriteria)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-bold"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showExpectedCriteria ? 'Hide Expected Criteria' : 'View Key Points Expected by Examiners'}</span>
            {showExpectedCriteria ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {showExpectedCriteria && (
            <div className="mt-3 p-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs space-y-2 animate-fade-in shadow-inner">
              <span className="font-bold text-slate-200">Key Criteria & Authorities Expected:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {currentQ.keyPointsExpected.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              {currentQ.sampleOutline && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-slate-400">
                  <span className="font-bold text-slate-300">Recommended Structure:</span>
                  <p className="mt-1 whitespace-pre-line font-mono text-[11px]">{currentQ.sampleOutline}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Writing Area Bento Card */}
      <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-indigo-400" />
            <span>Your Response</span>
          </h4>
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            {wordCount} words
          </span>
        </div>

        <textarea
          rows={10}
          placeholder="Draft your essay analysis here with reference to relevant authorities, statutes, and academic doctrines..."
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          className="w-full p-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans resize-y transition-colors"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>{showModelAnswer ? 'Hide Benchmark Model Answer' : 'Compare with Model Answer'}</span>
          </button>

          <button
            onClick={handleSubmitEssay}
            disabled={isGrading || !studentAnswer.trim()}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-xs"
          >
            {isGrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isGrading ? 'AI Grading in Progress...' : 'Submit for AI Rubric Evaluation'}</span>
          </button>
        </div>

        {/* Benchmark Model Answer */}
        {showModelAnswer && currentQ.modelAnswer && (
          <div className="mt-4 p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2 animate-fade-in text-xs shadow-md">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Benchmark Model Answer</span>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line font-serif text-sm">
              {currentQ.modelAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Evaluation Results Bento Card */}
      {latestSubmission && (
        <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-2xl space-y-6 animate-fade-in overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-100">AI Professor Assessment</h4>
                <p className="text-xs text-slate-400">Submitted on {latestSubmission.submittedAt}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black font-mono text-emerald-400">
                {latestSubmission.score}
                <span className="text-base text-slate-500 font-normal"> / 100</span>
              </div>
              <span className="text-[11px] text-slate-400 font-bold">
                {latestSubmission.score >= 70
                  ? 'First Class (Distinction)'
                  : latestSubmission.score >= 60
                  ? 'Upper Second Class (2:1)'
                  : latestSubmission.score >= 50
                  ? 'Lower Second Class (2:2)'
                  : 'Pass / Needs Revision'}
              </span>
            </div>
          </div>

          {/* 4-Pillar Rubric Breakdown */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4-Pillar Rubric Breakdown
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(latestSubmission.rubricFeedback || {}).map(([key, rawCat]) => {
                const cat = rawCat as { score: number; max: number; feedback: string };
                const titleMap: Record<string, string> = {
                  conceptualUnderstanding: 'Conceptual Understanding',
                  useOfEvidenceAndCases: 'Use of Authorities & Case Law',
                  criticalAnalysis: 'Critical & Policy Analysis',
                  structureAndClarity: 'Academic Structure & Clarity',
                };

                return (
                  <div key={key} className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-300">{titleMap[key] || key}</span>
                      <span className="font-mono text-slate-200">
                        {cat.score} / {cat.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${(cat.score / cat.max) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cat.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Comments */}
          <div className="p-5 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-2 text-xs shadow-inner">
            <span className="font-bold text-slate-200">Professor's General Summary:</span>
            <p className="text-slate-300 leading-relaxed">{latestSubmission.overallFeedback}</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {latestSubmission.strengths?.length > 0 && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-200/90">
                  {latestSubmission.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {latestSubmission.improvements?.length > 0 && (
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Recommended Improvements</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-200/90">
                  {latestSubmission.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
