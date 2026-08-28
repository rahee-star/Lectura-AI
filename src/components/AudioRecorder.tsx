import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Bookmark, Volume2, AlertCircle, Sparkles, FileText, Copy, Check } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, base64: string, durationSeconds: number, liveTranscript?: string) => void;
  onCancel?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [copiedLiveText, setCopiedLiveText] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const startRecording = async () => {
    setErrorMsg(null);
    setLiveTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio analysis for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onRecordingComplete(audioBlob, base64data, elapsedSeconds, liveTranscript);
        };

        // Stop live speech recognition
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.stop();
          } catch {}
        }

        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
      };

      // Real-time Browser Speech-to-Text Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            setLiveTranscript(fullText.trim());
          };

          recognition.onerror = (e: any) => {
            console.log('Live speech recognition notice:', e?.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('Speech recognition start failed:', recErr);
        }
      }

      recorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setElapsedSeconds(0);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Start visualizer
      drawVisualizer();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMsg('Microphone access denied or not supported in this browser. Please allow microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.start(); } catch {}
        }
        timerIntervalRef.current = window.setInterval(() => {
          setElapsedSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.stop(); } catch {}
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      }
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addBookmark = () => {
    const formatted = formatTime(elapsedSeconds);
    setBookmarks((prev) => [...prev, formatted]);
  };

  const handleCopyLiveTranscript = () => {
    if (!liveTranscript) return;
    navigator.clipboard.writeText(liveTranscript);
    setCopiedLiveText(true);
    setTimeout(() => setCopiedLiveText(false), 2000);
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);
        
        // Gradient color for audio waves
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    render();
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="audio-recorder-container" className="p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-700 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-slate-600'}`} />
          <div>
            <span className="font-bold text-sm text-slate-200 block">
              {isRecording ? (isPaused ? 'Recording Paused' : 'Live Audio Recording & Speech Transcription...') : 'Ready to Record & Transcribe Audio'}
            </span>
            <span className="text-[11px] text-slate-400">
              Captures audio + streams live spoken words to text • Max: 3 hours
            </span>
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-wider text-emerald-400 bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-700 shadow-inner">
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} width={500} height={90} className="w-full h-20 block" />
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-medium">
            <Volume2 className="w-4 h-4 mr-2 opacity-60" />
            Click "Start Recording" to transcribe speech into text in real-time
          </div>
        )}
      </div>

      {/* Real-time Live Speech-to-Text Preview Box */}
      {isRecording && (
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/40 shadow-inner space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Live Speech-to-Text Stream</span>
              </span>
            </div>
            {liveTranscript && (
              <button
                onClick={handleCopyLiveTranscript}
                className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy live transcribed text"
              >
                {copiedLiveText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLiveText ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-h-24 overflow-y-auto italic font-serif">
            {liveTranscript || 'Listening... Start speaking into your microphone to see live transcription.'}
          </p>
          {liveTranscript && (
            <div className="text-[10px] text-slate-500 flex items-center space-x-2">
              <span>{liveTranscript.split(/\s+/).filter(Boolean).length} words transcribed</span>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex items-start space-x-2 shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              id="btn-start-record"
              onClick={startRecording}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95 text-xs cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording & Transcribing</span>
            </button>
          ) : (
            <>
              <button
                id="btn-pause-record"
                onClick={pauseRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                id="btn-stop-record"
                onClick={stopRecording}
                className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish & Transcribe into Text</span>
              </button>

              <button
                id="btn-bookmark"
                onClick={addBookmark}
                title="Mark key moment in lecture"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
            </>
          )}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {bookmarks.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-bold text-slate-300">Bookmarks:</span>
          <div className="flex flex-wrap gap-1.5">
            {bookmarks.map((bm, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-lg font-mono text-[11px]">
                {bm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
