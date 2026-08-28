import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Sparkles,
  ShieldAlert,
  ThumbsUp,
} from 'lucide-react';
import { UserFeedback } from '../types';
import { getFeedbackList, saveFeedback, deleteFeedback } from '../services/storage';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: UserFeedback['category'];
  initialComplaint?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'general',
  initialComplaint = '',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<UserFeedback['category']>(initialCategory);
  const [complaintText, setComplaintText] = useState<string>(initialComplaint);
  const [userContact, setUserContact] = useState<string>('');
  const [submittedFeedbackList, setSubmittedFeedbackList] = useState<UserFeedback[]>([]);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  useEffect(() => {
    if (isOpen) {
      const list = getFeedbackList();
      setSubmittedFeedbackList(list);
      setIsSubmittedSuccess(false);
      if (initialComplaint) {
        setComplaintText(initialComplaint);
      }
      if (initialCategory) {
        setCategory(initialCategory);
      }
    }
  }, [isOpen, initialComplaint, initialCategory]);

  if (!isOpen) return null;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return '1/5 - Very Dissatisfied (Major Bugs / Errors)';
      case 2:
        return '2/5 - Dissatisfied (Needs Work)';
      case 3:
        return '3/5 - Neutral (Acceptable)';
      case 4:
        return '4/5 - Satisfied (Helpful & Good)';
      case 5:
        return '5/5 - Excellent (Fast, Accurate & Productive)';
      default:
        return 'Select a rating from 1 to 5 stars';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const newFeedback: UserFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      rating,
      category,
      complaint: complaintText.trim(),
      userContact: userContact.trim() || undefined,
      timestamp: new Date().toLocaleString(),
      status: 'received',
    };

    const updated = saveFeedback(newFeedback);
    setSubmittedFeedbackList(updated);
    setIsSubmittedSuccess(true);
    setComplaintText('');
    
    // Auto switch to history after 1.5 seconds or allow viewing
    setTimeout(() => {
      setActiveTab('history');
      setIsSubmittedSuccess(false);
    }, 1200);
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteFeedback(id);
    setSubmittedFeedbackList(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl shadow-sm">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Rate & Submit Complaints / Feedback
              </h3>
              <p className="text-xs text-slate-400">
                Help us improve transcription accuracy, UI, and study tools
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-700/80 bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-2.5 px-3 font-bold transition-all border-b-2 ${
              activeTab === 'submit'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit Feedback & Rating
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Submitted Complaints</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded-md font-mono">
              {submittedFeedbackList.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'submit' ? (
            isSubmittedSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Thank You For Your Feedback!</h4>
                <p className="text-xs text-slate-300 max-w-sm">
                  Your complaint and {rating}-star rating have been recorded. Our development team continuously refines audio models and fixes issues.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating Section */}
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-2 text-center shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Overall App Experience (1 - 5 Stars)
                  </span>
                  
                  <div className="flex items-center justify-center space-x-2 py-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                          title={`Rate ${starValue} Star${starValue > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs font-bold text-amber-300">
                    {getRatingLabel(hoverRating || rating)}
                  </p>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Feedback / Complaint Topic
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'audio_transcription', label: 'Audio / Transcription' },
                      { id: 'tangent_filtering', label: 'Tangent Filter' },
                      { id: 'notes_quality', label: 'Notes & Study Tools' },
                      { id: 'bug_issue', label: 'Bug / Permission Error' },
                      { id: 'feature_request', label: 'Feature Request' },
                      { id: 'general', label: 'General Feedback' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                          category === cat.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complaint Text */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Describe Your Complaint or Suggestion</span>
                    <span className="text-[11px] font-normal text-slate-400">Required</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="Provide details of any bug, audio transcription issue (e.g. speech transcribed as code, 403 access denied errors), or UI improvements you would like..."
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                {/* Contact Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Contact Email (Optional - for resolution updates)
                  </label>
                  <input
                    type="email"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    placeholder="e.g. student@university.edu"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={!complaintText.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {rating}-Star Rating & Complaint</span>
                </button>
              </form>
            )
          ) : (
            <div className="space-y-4">
              {submittedFeedbackList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">No complaints or feedback logged yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Use the form to rate the app or report any issues.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submittedFeedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-200">
                            {item.rating}/5 Stars
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {item.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.complaint}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span className="capitalize">Category: {item.category.replace('_', ' ')}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">All student feedback is prioritized for continual accuracy updates</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
