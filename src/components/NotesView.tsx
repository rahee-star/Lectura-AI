import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  GraduationCap,
  Scale,
  Download,
  Copy,
  Check,
  Clock,
  FilterX,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode,
} from 'lucide-react';
import { LectureNote, KeyTopic } from '../types';
import { exportLectureToMarkdown, exportLectureToPDF } from '../services/exportService';

interface NotesViewProps {
  lecture: LectureNote;
  onOpenResearch: (topic: string, context?: string) => void;
  onSeekAudio?: (seconds: number) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  lecture,
  onOpenResearch,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'topic-1': true,
    'topic-2': true,
  });

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    lecture.notes.keyTopics.forEach((t) => (all[t.id] = true));
    setExpandedTopics(all);
  };

  const collapseAll = () => {
    setExpandedTopics({});
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const copyNotesToClipboard = () => {
    const text = `
# ${lecture.title}
**Subject:** ${lecture.subject} | **Lecturer:** ${lecture.lecturer} | **Date:** ${lecture.date}

## Executive Summary
${lecture.notes.executiveSummary}

## Key Topics
${lecture.notes.keyTopics
  .map(
    (t) => `
### ${t.title}
${t.description}

*Core Points:*
${t.corePoints.map((p) => `- ${p}`).join('\n')}

${t.analogies ? `*Analogy:* ${t.analogies.join('\n')}` : ''}
${t.examTips ? `*Exam Tips:* ${t.examTips.join('\n')}` : ''}
`
  )
  .join('\n')}

## Key Terms Glossary
${lecture.notes.keyTermsGlossary.map((k) => `- **${k.term}**: ${k.definition} (${k.simplifiedExplanation})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    exportLectureToMarkdown(lecture);
  };

  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      exportLectureToPDF(lecture);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-bold text-slate-200">Lecture Digest:</span>
          <span>{lecture.notes.keyTopics.length} Major Modules</span>
          <span>•</span>
          <span>{lecture.notes.keyTermsGlossary.length} Glossary Terms</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Collapse All
          </button>
          <button
            onClick={copyNotesToClipboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Copy notes to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export as Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Export synthesized notes as Markdown (.md) file"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export .MD</span>
          </button>

          {/* Export as PDF */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Export complete synthesized lecture notes as formatted PDF document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* AI Tangents Filter Alert Bento Banner */}
      {lecture.notes.unnecessaryTangentsSummary && (
        <div className="p-6 bg-[#1E293B] border border-emerald-500/30 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shrink-0 mt-0.5 shadow-sm">
                <FilterX className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <span>AI Lecture Distraction Filter Active</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold rounded-full border border-emerald-500/30">
                    {lecture.notes.unnecessaryTangentsSummary.totalTimeSavedMinutes} mins saved
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The AI detected and stripped out <strong>{lecture.notes.unnecessaryTangentsSummary.flaggedItemsCount} irrelevant tangents</strong> (casual sports talk, classroom microphone checks, window distractions, and syllabus admin warnings) so you only study pure examinable material.
                </p>
                
                {/* Tangents snippets */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {lecture.notes.unnecessaryTangentsSummary.tangentHighlights.map((th, i) => (
                    <span key={i} className="text-[11px] px-3 py-1 bg-slate-900/90 text-slate-300 border border-slate-700 rounded-xl flex items-center space-x-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{th}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Bento Card */}
      <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl space-y-3 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        <div className="flex items-center space-x-2.5 text-indigo-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300">
            Executive Summary & Lecture Thesis
          </h3>
        </div>
        <p className="text-slate-200 text-sm md:text-base leading-relaxed font-normal">
          {lecture.notes.executiveSummary}
        </p>
      </div>

      {/* Key Topics List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Synthesized Study Modules & Case Law
        </h3>

        {lecture.notes.keyTopics.map((topic, index) => {
          const isExpanded = expandedTopics[topic.id] ?? false;

          return (
            <div
              key={topic.id}
              className="bg-[#1E293B] border border-slate-700 rounded-3xl overflow-hidden shadow-lg hover:border-slate-600 transition-all"
            >
              {/* Header */}
              <div
                onClick={() => toggleTopic(topic.id)}
                className="p-5 flex items-start justify-between cursor-pointer select-none hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    0{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-slate-100">{topic.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{topic.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenResearch(topic.title, topic.corePoints.join(' '));
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Deep Research</span>
                  </button>
                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Body */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-700/80 space-y-5 text-sm">
                  {/* Core Points */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Core Academic Principles
                    </h5>
                    <ul className="space-y-2">
                      {topic.corePoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start space-x-2.5 text-slate-200 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Analogies Section */}
                  {topic.analogies && topic.analogies.length > 0 && (
                    <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-1.5">
                        <Lightbulb className="w-4 h-4" />
                        <span>Intuitive Mental Model / Analogy</span>
                      </div>
                      <p className="text-xs text-amber-100 leading-relaxed italic">
                        "{topic.analogies.join(' ')}"
                      </p>
                    </div>
                  )}

                  {/* Deep Research Authorities / Cases */}
                  {topic.deepResearchContext?.keyCasesOrTheorems && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" />
                        <span>Seminal Legal Precedents & Authorities</span>
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        {topic.deepResearchContext.keyCasesOrTheorems.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className="font-bold text-slate-100 text-sm">{c.name}</span>
                              {c.citation && (
                                <span className="font-mono text-[11px] text-indigo-300 px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/20 rounded-md">
                                  {c.citation}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300">
                              <strong className="text-indigo-300">Ratio / Principle:</strong> {c.principle}
                            </p>
                            {c.relevance && (
                              <p className="text-xs text-slate-400">
                                <strong className="text-emerald-400">Modern Relevance:</strong> {c.relevance}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historical & Critical Analysis */}
                  {topic.deepResearchContext?.historicalBackground && (
                    <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-slate-300">Historical Evolution:</span>
                      <p className="text-slate-400 leading-relaxed">
                        {topic.deepResearchContext.historicalBackground}
                      </p>
                    </div>
                  )}

                  {/* Exam Tips Callout */}
                  {topic.examTips && topic.examTips.length > 0 && (
                    <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start space-x-3 shadow-sm">
                      <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-indigo-300">High-Yield Exam Strategy:</span>
                        <ul className="list-disc list-inside text-indigo-200/90 space-y-0.5">
                          {topic.examTips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Terms Glossary Bento Card */}
      {lecture.notes.keyTermsGlossary && lecture.notes.keyTermsGlossary.length > 0 && (
        <div className="relative p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl space-y-4 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Key Terms & Simplified Definitions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lecture.notes.keyTermsGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-2 hover:border-slate-600 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-indigo-300">{item.term}</h4>
                  <button
                    onClick={() => onOpenResearch(item.term, item.definition)}
                    className="text-slate-400 hover:text-indigo-300 p-1 text-xs"
                    title="Deep dive research on term"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300">{item.definition}</p>
                <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <strong className="text-emerald-400">Plain English:</strong> {item.simplifiedExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
