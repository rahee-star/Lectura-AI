import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Mail,
  User,
  Building2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (profile: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin }) => {
  const [name, setName] = useState('Khadijat Yakub');
  const [email, setEmail] = useState('yakhadijat@unilorin.edu.ng');
  const [university, setUniversity] = useState('University of Ilorin (UNILORIN)');
  const [faculty, setFaculty] = useState('Faculty of Law');
  const [studyLevel, setStudyLevel] = useState('LL.B Undergraduate (400L)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !university.trim()) {
      setError('Please fill in all required academic login credentials.');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      faculty: faculty.trim() || 'General Studies',
      studyLevel: studyLevel || 'Undergraduate',
      isAuthenticated: true,
      avatarColor: 'bg-indigo-600',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onLogin(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#1E293B] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-black text-white tracking-tight">LECTURA AI</span>
              <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                Student Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enter your student verification details to unlock your personalized lecture notes & study suite.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex items-center space-x-2">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Khadijat Yakub"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student / Institutional Email *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yakhadijat@unilorin.edu.ng"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>University / College *</span>
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. University of Ilorin"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Faculty / Department</span>
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Faculty of Law"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Academic Level</span>
            </label>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="LL.B Undergraduate (400L)">LL.B Undergraduate (400L / Final Year)</option>
              <option value="Undergraduate (100L-300L)">Undergraduate (100L - 300L)</option>
              <option value="Postgraduate / Masters (LL.M / MSc)">Postgraduate / Masters (LL.M / MSc)</option>
              <option value="PhD Researcher">PhD / Doctoral Researcher</option>
              <option value="Bar / Professional Candidate">Law School / Bar Exam Candidate</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            <span>Enter LECTURA AI Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security & Feature Badges */}
        <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Local Student Storage</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>5-Day Active Streak Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
