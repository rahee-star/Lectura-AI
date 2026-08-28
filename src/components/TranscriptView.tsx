import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlayCircle,
  AlertTriangle,
  Volume2,
  Coffee,
  Mic,
  Info,
  CheckCircle,
  Copy,
  Check,
  Download,
  FileText,
  List,
  Edit2,
  Save,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TranscriptSegment } from '../types';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  onSeekAudio?: (seconds: number) => void;
  currentPlaybackSeconds?: number;
  onUpdateTranscriptSegment?: (id: string, newText: string) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcript,
  onSeekAudio,
  currentPlaybackSeconds = 0,
  onUpdateTranscriptSegment,
}) => {
  const [filterMode, setFilterMode] = useState<'clean' | 'all'>('all');
  const [displayMode, setDisplayMode] = useState<'segments' | 'text'>('segments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const speakers = Array.from(new Set(transcript.map((t) => t.speaker)));

  // Calculate statistics
  const totalWords = transcript.reduce((acc, seg) => acc + (seg.text?.split(/\s+/).filter(Boolean).length || 0), 0);
  const cleanSegments = transcript.filter((seg) => !seg.isUnnecessary);
  const cleanWords = cleanSegments.reduce((acc, seg) => acc + (seg.text?.split(/\s+/).filter(Boolean).length || 0), 0);
  const tangentsCount = transcript.filter((seg) => seg.isUnnecessary).length;
  const estimatedReadingMins = Math.max(1, Math.ceil(cleanWords / 200));

  const filteredSegments = transcript.filter((seg) => {
    // Filter out tangents if in 'clean' mode
    if (filterMode === 'clean' && seg.isUnnecessary) {
      return false;
    }
    // Speaker filter
    if (selectedSpeaker !== 'all' && seg.speaker !== selectedSpeaker) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        seg.text.toLowerCase().includes(q) ||
        seg.speaker.toLowerCase().includes(q) ||
        (seg.tangentReason && seg.tangentReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyCleanText = () => {
    const text = cleanSegments.map((s) => s.text).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAction('clean');
    setTimeout(() => setCopiedAction(null), 2200);
  };

  const handleCopyFullTranscript = () => {
    const text = transcript
      .map((s) => `[${s.timestamp}] ${s.speaker}: ${s.text}${s.isUnnecessary ? ' (Flagged Tangent)' : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAction('full');
    setTimeout(() => setCopiedAction(null), 2200);
  };

  const handleDownloadTxt = () => {
    const content = transcript
      .map((s) => `[${s.timestamp}] ${s.speaker}:\n${s.text}\n`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lecture-transcript-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const content = `# University Lecture Audio Transcript\n\n` +
      `**Total Words:** ${totalWords} | **Reading Time:** ~${estimatedReadingMins} mins\n\n---\n\n` +
      transcript
        .map((s) => `### [${s.timestamp}] ${s.speaker} ${s.isUnnecessary ? '*(Lecturer Tangent)*' : ''}\n\n${s.text}\n`)
        .join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lecture-transcript-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startEdit = (seg: TranscriptSegment) => {
    setEditingSegmentId(seg.id);
    setEditingText(seg.text);
  };

  const saveEdit = (id: string) => {
    if (onUpdateTranscriptSegment) {
      onUpdateTranscriptSegment(id, editingText);
    }
    setEditingSegmentId(null);
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'chitchat':
        return { icon: Coffee, label: 'Chit-Chat / Banter', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'mic-check':
        return { icon: Mic, label: 'Audio / Mic Check', color: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'administrative':
        return { icon: Info, label: 'Course Admin Notice', color: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'digression':
        return { icon: AlertTriangle, label: 'Room Digression', color: 'bg-orange-950 text-orange-300 border-orange-800' };
      default:
        return { icon: AlertTriangle, label: 'Lecturer Tangent', color: 'bg-amber-950 text-amber-300 border-amber-800' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Transcript Metadata & Action Header */}
      <div className="p-4 md:p-5 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>Speech-to-Text Transcript</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full text-[10px] font-mono">
                  {totalWords.toLocaleString()} Words
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Full academic transcription • ~{estimatedReadingMins} min read • {tangentsCount} tangents identified
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyCleanText}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Copy clean lecture text without filler"
            >
              {copiedAction === 'clean' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedAction === 'clean' ? 'Clean Copied!' : 'Copy Clean Text'}</span>
            </button>

            <button
              onClick={handleCopyFullTranscript}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Copy verbatim transcript with timestamps & speakers"
            >
              {copiedAction === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedAction === 'full' ? 'Full Copied!' : 'Copy All + Timestamps'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              title="Download text file (.txt)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Download Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.MD</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="pt-2 border-t border-slate-750 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transcript text, case laws, terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* View Format Toggle (Segments vs Continuous Text) */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-700 rounded-xl">
            <button
              onClick={() => setDisplayMode('segments')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                displayMode === 'segments'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Segments</span>
            </button>
            <button
              onClick={() => setDisplayMode('text')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                displayMode === 'text'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Continuous Text</span>
            </button>
          </div>

          {/* Tangent Filter Toggle */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-700 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Dialogue
            </button>
            <button
              onClick={() => setFilterMode('clean')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                filterMode === 'clean'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Clean Only</span>
            </button>
          </div>

          {/* Speaker Filter */}
          {speakers.length > 1 && (
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Speakers ({speakers.length})</option>
              {speakers.map((spk) => (
                <option key={spk} value={spk}>
                  {spk}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transcript Rendering: Continuous Text View */}
      {displayMode === 'text' && (
        <div className="p-6 md:p-8 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-750 text-xs text-slate-400">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Continuous Formatted Lecture Text ({filterMode === 'clean' ? 'Filtered Clean Prose' : 'Verbatim Spoken Dialogue'})
            </span>
            <span>{filteredSegments.length} Segments included</span>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4 font-normal">
            {filteredSegments.map((seg) => (
              <p
                key={seg.id}
                className={`p-3 rounded-2xl transition-all ${
                  seg.isUnnecessary
                    ? 'bg-amber-950/20 border border-amber-500/20 text-slate-400 line-through decoration-slate-600'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <span
                  onClick={() => onSeekAudio && onSeekAudio(seg.timeSeconds)}
                  className="font-mono text-indigo-400 font-bold text-xs mr-2 cursor-pointer hover:underline"
                  title="Click to jump audio here"
                >
                  [{seg.timestamp}] {seg.speaker}:
                </span>
                {seg.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Rendering: Segmented Dialogue View */}
      {displayMode === 'segments' && (
        <div className="space-y-3">
          {filteredSegments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-[#1E293B] border border-slate-700 rounded-3xl shadow-xl">
              No matching transcript segments found for your search query.
            </div>
          ) : (
            filteredSegments.map((segment) => {
              const isPlayingNow =
                Math.abs(segment.timeSeconds - currentPlaybackSeconds) < 60 &&
                currentPlaybackSeconds >= segment.timeSeconds;

              const badge = segment.isUnnecessary ? getCategoryBadge(segment.tangentCategory) : null;
              const Icon = badge?.icon;
              const isEditingThis = editingSegmentId === segment.id;

              return (
                <div
                  key={segment.id}
                  className={`p-5 rounded-2xl border transition-all shadow-sm ${
                    segment.isUnnecessary
                      ? 'bg-[#1E293B]/70 border-amber-500/30 opacity-80 hover:opacity-100'
                      : isPlayingNow
                      ? 'bg-[#1E293B] border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#1E293B] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2.5">
                      {/* Timestamp Button */}
                      <button
                        onClick={() => onSeekAudio && onSeekAudio(segment.timeSeconds)}
                        className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-indigo-950 text-indigo-400 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/40 rounded-xl text-xs font-mono font-bold transition-all group cursor-pointer"
                        title="Jump audio playback to this timestamp"
                      >
                        <PlayCircle className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 text-indigo-400" />
                        <span>{segment.timestamp}</span>
                      </button>

                      <span className="font-bold text-xs text-slate-200">{segment.speaker}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Flagged Tangent Pill */}
                      {segment.isUnnecessary && badge && (
                        <div
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${badge.color}`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          <span>Flagged: {badge.label}</span>
                        </div>
                      )}

                      {/* Edit Segment Button */}
                      {!isEditingThis ? (
                        <button
                          onClick={() => startEdit(segment)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit transcribed words"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => saveEdit(segment.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reason Banner if flagged */}
                  {segment.isUnnecessary && segment.tangentReason && (
                    <div className="mb-2.5 px-3.5 py-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center space-x-1.5">
                      <span className="font-bold">AI Filter Reason:</span>
                      <span>{segment.tangentReason}</span>
                    </div>
                  )}

                  {/* Spoken Text or Edit Input */}
                  {isEditingThis ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-slate-900 border border-indigo-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                    />
                  ) : (
                    <p
                      className={`text-sm leading-relaxed ${
                        segment.isUnnecessary ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'
                      }`}
                    >
                      {segment.text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
