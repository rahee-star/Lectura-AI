import React, { useState } from 'react';
import {
  X,
  Mic,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen,
  Zap,
  Volume2,
  FileAudio,
  Check,
} from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { processLectureWithAI, transcribeAudioOnly } from '../services/api';
import { LectureNote } from '../types';

interface NewLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureCreated: (newLecture: LectureNote) => void;
}

export const NewLectureModal: React.FC<NewLectureModalProps> = ({
  isOpen,
  onClose,
  onLectureCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'text' | 'sample'>('record');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureSubject, setLectureSubject] = useState('Law (Jurisprudence)');
  const [lecturerName, setLecturerName] = useState('Prof. Julian Vance');
  const [rawText, setRawText] = useState('');
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [transcribeMode, setTranscribeMode] = useState<'full' | 'transcript_only'>('full');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const samplePresets = [
    {
      title: 'Introduction to Law of Tort: Duty of Care & Negligence',
      subject: 'Law (Jurisprudence)',
      lecturer: 'Prof. Julian Vance',
      desc: 'Donoghue v Stevenson, Caparo tripartite test, reasonable person standard, and risk balancing.',
    },
    {
      title: 'Medical Physiology: Action Potentials & Synaptic Transmission',
      subject: 'Medicine & Neurobiology',
      lecturer: 'Dr. Evelyn Reed',
      desc: 'Voltage-gated ion channels, sodium-potassium ATPase, neurotransmitter vesicle release, and synaptic plasticity.',
    },
    {
      title: 'Computer Science: Distributed Consensus & Raft Protocol',
      subject: 'Computer Science',
      lecturer: 'Prof. Alan Thorne',
      desc: 'Leader election, log replication, safety invariants, Byzantine fault tolerance, and split-brain resolution.',
    },
    {
      title: 'Macroeconomics: Central Bank Policy & Inflation Targeting',
      subject: 'Economics & Finance',
      lecturer: 'Prof. Marcus Silva',
      desc: 'Taylor rule, open market operations, quantitative easing, Phillips curve dynamics, and liquidity traps.',
    },
  ];

  if (!isOpen) return null;

  const processAudioFile = (file: File) => {
    setUploadedAudioFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|webm|ogg|aac|flac)$/i))) {
      processAudioFile(file);
    }
  };

  const handleRecordComplete = async (blob: Blob, base64: string, durationSec: number, liveTranscript?: string) => {
    await runAIProcessingPipeline({
      audioBase64: base64,
      audioMime: blob.type || 'audio/webm',
      durationSeconds: durationSec || 1800,
      rawTranscriptText: liveTranscript,
    });
  };

  const handleProcessFromUpload = async (modeOverride?: 'full' | 'transcript_only') => {
    if (!uploadedBase64 && !uploadedAudioFile) return;
    const mode = modeOverride || transcribeMode;
    await runAIProcessingPipeline({
      audioBase64: uploadedBase64 || undefined,
      audioMime: uploadedAudioFile?.type || 'audio/mp3',
      durationSeconds: 2400,
      mode,
    });
  };

  const handleProcessFromText = async () => {
    if (!rawText.trim()) return;
    await runAIProcessingPipeline({
      rawTranscriptText: rawText,
      durationSeconds: 1800,
    });
  };

  const handleSelectPreset = (preset: (typeof samplePresets)[0]) => {
    setLectureTitle(preset.title);
    setLectureSubject(preset.subject);
    setLecturerName(preset.lecturer);
  };

  const runAIProcessingPipeline = async (extraParams: {
    audioBase64?: string;
    audioMime?: string;
    rawTranscriptText?: string;
    durationSeconds?: number;
    mode?: 'full' | 'transcript_only';
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(1);

    // Step progression animation timer
    const stepInterval = window.setInterval(() => {
      setProcessingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      let completeLecture: LectureNote;

      if (extraParams.mode === 'transcript_only' && extraParams.audioBase64) {
        // Fast dedicated audio-to-text transcription
        const transResult = await transcribeAudioOnly({
          audioBase64: extraParams.audioBase64,
          audioMime: extraParams.audioMime,
          lectureTopic: lectureTitle || 'Audio Transcription',
          lectureSubject: lectureSubject || 'Academic Lecture',
          lecturerName: lecturerName || 'Speaker',
        });

        clearInterval(stepInterval);
        setProcessingStep(5);

        completeLecture = {
          id: `lecture-${Date.now()}`,
          title: lectureTitle || 'Audio Transcription',
          subject: lectureSubject || 'Academic Lecture',
          lecturer: lecturerName || 'Speaker',
          date: new Date().toISOString().split('T')[0],
          durationSeconds: transResult.durationSeconds || extraParams.durationSeconds || 1800,
          audioBase64: extraParams.audioBase64,
          status: 'ready',
          transcript: transResult.transcript || [],
          notes: {
            executiveSummary: transResult.cleanText || transResult.fullText || 'Transcribed audio lecture notes.',
            keyTopics: [
              {
                id: 'topic-1',
                title: 'Audio Speech-to-Text Transcription',
                description: 'Direct speech-to-text verbatim audio transcription with speakers and timestamps.',
                corePoints: ['Verbatim speech transcribed directly from audio.', 'Automatic tangent filtering enabled.'],
              },
            ],
            unnecessaryTangentsSummary: { totalTimeSavedMinutes: 0, flaggedItemsCount: 0, tangentHighlights: [] },
            keyTermsGlossary: [],
            mindMapNodes: [],
          },
          flashcards: [],
          quizzes: [],
          essayQuestions: [],
          essaySubmissions: [],
          chatHistory: [
            {
              id: `msg-welcome-${Date.now()}`,
              role: 'assistant',
              content: `Hello! I have transcribed your audio into text. You can copy the full transcript, download as TXT/MD, or ask me any questions!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      } else {
        // Full synthesis with notes, flashcards, and quizzes
        const result = await processLectureWithAI({
          audioBase64: extraParams.audioBase64,
          audioMime: extraParams.audioMime,
          rawTranscriptText: extraParams.rawTranscriptText,
          lectureTopic: lectureTitle || 'Introduction to Law of Tort: Duty of Care & Negligence',
          lectureSubject: lectureSubject || 'Law',
          lecturerName: lecturerName || 'Course Lecturer',
        });

        clearInterval(stepInterval);
        setProcessingStep(5);

        completeLecture = {
          id: `lecture-${Date.now()}`,
          title: lectureTitle || (result.title as string) || 'University Lecture Note',
          subject: lectureSubject || (result.subject as string) || 'Academic Subject',
          lecturer: lecturerName || (result.lecturer as string) || 'Lecturer',
          date: new Date().toISOString().split('T')[0],
          durationSeconds: extraParams.durationSeconds || 3600,
          audioBase64: extraParams.audioBase64,
          status: 'ready',
          transcript: result.transcript || [],
          notes: result.notes || {
            executiveSummary: 'Synthesized lecture notes.',
            keyTopics: [],
            unnecessaryTangentsSummary: { totalTimeSavedMinutes: 0, flaggedItemsCount: 0, tangentHighlights: [] },
            keyTermsGlossary: [],
            mindMapNodes: [],
          },
          flashcards: result.flashcards || [],
          quizzes: result.quizzes || [],
          essayQuestions: result.essayQuestions || [],
          essaySubmissions: [],
          chatHistory: [
            {
              id: `msg-welcome-${Date.now()}`,
              role: 'assistant',
              content: `Hello! I have completed transcribing and synthesizing your lecture on **${
                lectureTitle || 'your subject'
              }**. The tangents and filler have been filtered out, and your full study suite is ready!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      }

      setTimeout(() => {
        setIsProcessing(false);
        onLectureCreated(completeLecture);
        onClose();
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMessage(err.message || 'AI processing failed. Please check network or Gemini API settings.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative bg-[#1E293B] border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-2xl shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Audio Transcription & Lecture Intelligence</h3>
              <p className="text-xs text-slate-400">
                Transcribe live/uploaded audio into text, filter lecturer tangents, and build master study packs
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        {isProcessing ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse shadow-xl shadow-indigo-500/20">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg text-slate-100">Transcribing Audio & Generating Notes</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Converting spoken words into text transcript, diarizing speakers, auditing tangents, and formulating study notes.
              </p>
            </div>

            {/* Stepper */}
            <div className="w-full max-w-md space-y-3 text-left text-xs">
              <div
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  processingStep >= 1
                    ? 'bg-slate-900 border-indigo-500 text-indigo-200 font-bold shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {processingStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                )}
                <span>1. Transcribing Audio Speech-to-Text & Diarization</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  processingStep >= 2
                    ? 'bg-slate-900 border-indigo-500 text-indigo-200 font-bold shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {processingStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : processingStep === 2 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span>2. Flagging & Filtering Lecturer Tangents & Filler</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  processingStep >= 3
                    ? 'bg-slate-900 border-indigo-500 text-indigo-200 font-bold shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {processingStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : processingStep === 3 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span>3. Formulating Synthesis, Explanations & Precedents</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                  processingStep >= 4
                    ? 'bg-slate-900 border-indigo-500 text-indigo-200 font-bold shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {processingStep >= 5 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : processingStep === 4 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span>4. Finalizing Full Study Pack</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Lecture Title / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Law of Tort: Duty of Care"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Course / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Law of Tort"
                  value={lectureSubject}
                  onChange={(e) => setLectureSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Lecturer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Vance"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-700/80 pb-3 text-xs overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('record')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'record'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Record Audio & Transcribe</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio File & Transcribe</span>
              </button>

              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Notes / Transcript</span>
              </button>

              <button
                onClick={() => setActiveTab('sample')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'sample'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Presets</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs shadow-md">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            {/* Tab 1: Live Audio Recording */}
            {activeTab === 'record' && (
              <div>
                <AudioRecorder
                  onRecordingComplete={handleRecordComplete}
                  onCancel={onClose}
                />
              </div>
            )}

            {/* Tab 2: Upload Audio File */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 transition-all ${
                    isDragOver
                      ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01]'
                      : 'border-slate-700 hover:border-indigo-500/80 bg-slate-900/60'
                  }`}
                >
                  <div className="w-14 h-14 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-md border border-slate-700">
                    <FileAudio className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {uploadedAudioFile ? uploadedAudioFile.name : 'Select or drag & drop lecture audio file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports MP3, WAV, M4A, AAC, WebM, OGG, FLAC (Up to 50MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.webm,.ogg,.flac"
                    onChange={handleFileUpload}
                    className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer shadow-sm"
                  />
                  {uploadedAudioFile && (
                    <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ready: {(uploadedAudioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>

                {/* Processing Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProcessFromUpload('full')}
                    disabled={!uploadedBase64}
                    className="py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Transcribe & Build Full Study Suite</span>
                  </button>

                  <button
                    onClick={() => handleProcessFromUpload('transcript_only')}
                    disabled={!uploadedBase64}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 font-bold rounded-2xl transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Transcribe Audio to Text Only</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Paste Text */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <textarea
                  rows={8}
                  placeholder="Paste your raw lecture transcript, rough class scratchpad, or bullet notes here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                />

                <button
                  onClick={handleProcessFromText}
                  disabled={!rawText.trim()}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Notes, Filter Tangents & Build Tests</span>
                </button>
              </div>
            )}

            {/* Tab 4: Sample Presets */}
            {activeTab === 'sample' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a pre-curated university syllabus topic to test full AI synthesis and lecture note formulation:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {samplePresets.map((sp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(sp)}
                      className="p-4 bg-slate-900/90 border border-slate-700 hover:border-indigo-500/80 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
                    >
                      <span className="text-[10px] text-indigo-400 font-bold block">{sp.subject}</span>
                      <h5 className="font-bold text-xs text-slate-200 group-hover:text-indigo-300">
                        {sp.title}
                      </h5>
                      <p className="text-[11px] text-slate-400">{sp.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => runAIProcessingPipeline({ durationSeconds: 3840 })}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Generate Complete Study Package for Selected Topic</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
