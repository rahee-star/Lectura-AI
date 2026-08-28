import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc?: string;
  durationSeconds?: number;
  currentSeekTime?: number;
  onTimeUpdate?: (seconds: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  durationSeconds = 3600,
  currentSeekTime,
  onTimeUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSimulated, setIsSimulated] = useState(!audioSrc);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simulatedIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioSrc) {
      setIsSimulated(false);
    } else {
      setIsSimulated(true);
    }
  }, [audioSrc]);

  useEffect(() => {
    if (currentSeekTime !== undefined) {
      setCurrentTime(currentSeekTime);
      if (audioRef.current && !isSimulated) {
        audioRef.current.currentTime = currentSeekTime;
      }
    }
  }, [currentSeekTime, isSimulated]);

  const togglePlay = () => {
    if (isSimulated) {
      if (isPlaying) {
        if (simulatedIntervalRef.current) clearInterval(simulatedIntervalRef.current);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        simulatedIntervalRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 1 * playbackRate;
            if (next >= durationSeconds) {
              clearInterval(simulatedIntervalRef.current!);
              setIsPlaying(false);
              return 0;
            }
            if (onTimeUpdate) onTimeUpdate(next);
            return next;
          });
        }, 1000);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current && !isSimulated) {
      audioRef.current.currentTime = target;
    }
    if (onTimeUpdate) onTimeUpdate(target);
  };

  const skipTime = (offset: number) => {
    const nextTime = Math.max(0, Math.min(durationSeconds, currentTime + offset));
    setCurrentTime(nextTime);
    if (audioRef.current && !isSimulated) {
      audioRef.current.currentTime = nextTime;
    }
    if (onTimeUpdate) onTimeUpdate(nextTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (simulatedIntervalRef.current) clearInterval(simulatedIntervalRef.current);
    };
  }, []);

  return (
    <div id="lecture-audio-player" className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-slate-100 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-60" />
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
              if (onTimeUpdate) onTimeUpdate(audioRef.current.currentTime);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex flex-col space-y-2.5">
        {/* Timeline Bar */}
        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="text-slate-300 font-semibold">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={durationSeconds}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2.5 transition-all"
          />
          <span className="text-slate-400">{formatTime(durationSeconds)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => skipTime(-15)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
              title="Rewind 15 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => skipTime(15)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
              title="Fast-forward 15 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2 font-medium">
            <span className="hidden sm:inline">Track:</span>
            <span className="px-2.5 py-1 bg-slate-800/90 text-indigo-300 border border-slate-700/60 rounded-lg font-sans text-[11px] flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isSimulated ? 'Classroom Recording (Simulated)' : 'Live Mic Master'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={cyclePlaybackRate}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-colors"
              title="Change playback speed"
            >
              {playbackRate}x
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
