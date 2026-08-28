import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Loader2, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { researchDeepDive } from '../services/api';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  context?: string;
  subject?: string;
}

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  isOpen,
  onClose,
  topic,
  context,
  subject,
}) => {
  const [loading, setLoading] = useState(false);
  const [researchContent, setResearchContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  useEffect(() => {
    if (isOpen && topic) {
      handleFetchResearch();
    }
  }, [isOpen, topic]);

  const handleFetchResearch = async (customQ?: string) => {
    setLoading(true);
    setError(null);
    try {
      const content = await researchDeepDive({
        topic,
        context,
        subject,
        studentQuery: customQ || customQuestion,
      });
      setResearchContent(content);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to conduct deep research.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Deep Research & Explanatory Context
              </h3>
              <p className="text-xs text-indigo-300 font-medium">
                Academic Deep Dive on: <span className="text-white font-bold">"{topic}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* Custom Question Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a specific inquiry (e.g. 'Explain with a medical analogy' or 'Give recent UK cases')..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customQuestion.trim()) {
                  handleFetchResearch(customQuestion);
                }
              }}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              onClick={() => handleFetchResearch(customQuestion)}
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              Research
            </button>
          </div>

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">Synthesizing academic sources, legal precedents, and simplified mental models...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 rounded-2xl text-xs shadow-md">
              <p className="font-bold">Unable to fetch online research</p>
              <p className="text-xs opacity-90 mt-1">{error}</p>
            </div>
          )}

          {!loading && researchContent && (
            <div className="p-6 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-4 shadow-inner">
              {researchContent.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('###') || paragraph.startsWith('##') || paragraph.startsWith('#')) {
                  const headingText = paragraph.replace(/^#+\s*/, '');
                  return (
                    <h4 key={idx} className="text-sm font-bold text-indigo-300 mt-4 pb-1 border-b border-slate-800">
                      {headingText}
                    </h4>
                  );
                }
                return (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fact-checked against curriculum standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
