import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, HelpCircle } from 'lucide-react';
import { ChatMessage, LectureNote } from '../types';
import { sendLectureChatMessage } from '../services/api';

interface LectureChatViewProps {
  lecture: LectureNote;
  onUpdateChatHistory: (updated: ChatMessage[]) => void;
}

export const LectureChatView: React.FC<LectureChatViewProps> = ({
  lecture,
  onUpdateChatHistory,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const defaultSuggestedQueries = [
    'Explain Donoghue v Stevenson with a simple modern analogy',
    'What are the most likely exam essay questions from this lecture?',
    'How do English courts balance likelihood vs cost of precautions?',
    'Give me a hypothetical tort scenario and test my legal analysis',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lecture.chatHistory, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...(lecture.chatHistory || []), userMsg];
    onUpdateChatHistory(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const reply = await sendLectureChatMessage({
        lectureTitle: lecture.title,
        lectureSubject: lecture.subject,
        notesSummary: lecture.notes,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        message: textToSend,
      });

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateChatHistory([...newHistory, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'I encountered an error connecting to the AI Tutor. Please verify your connection or Gemini API key in Settings > Secrets.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateChatHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[700px] max-w-4xl mx-auto bg-[#1E293B] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      {/* Chat Top Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">AI Lecture Teaching Assistant</h3>
            <p className="text-[11px] text-slate-400">
              Trained on "{lecture.title}"
            </p>
          </div>
        </div>

        <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800 font-bold">
          Context Ready
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-700/80 overflow-x-auto flex items-center space-x-2 text-xs scrollbar-none">
        <span className="text-slate-400 font-bold text-[11px] shrink-0">Ask:</span>
        {defaultSuggestedQueries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(query)}
            className="px-3.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-indigo-300 rounded-xl whitespace-nowrap transition-colors text-[11px] font-medium shadow-sm"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {(lecture.chatHistory || []).map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 border border-slate-700 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-indigo-500 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-700 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{msg.content}</div>
                <span
                  className={`block text-[10px] mt-1 ${isUser ? 'text-indigo-100' : 'text-slate-500'}`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700 shadow-md">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing lecture cases and structuring explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask a question about this lecture (e.g. 'Can you explain the Caparo test with an example?')..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
