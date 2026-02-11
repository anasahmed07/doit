"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface CustomAudioPlayerProps {
  src: string;
  compact?: boolean;
}

export function CustomAudioPlayer({ src, compact = false }: CustomAudioPlayerProps) {
  const [isPlaying, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsRecording(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPos = (x / rect.width);
      audioRef.current.currentTime = clickedPos * duration;
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 bg-secondary/30 border-2 border-foreground p-2 font-mono ${compact ? "h-10 text-[10px]" : "h-14 text-xs shadow-hard-sm"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsRecording(false)}
      />
      
      <button 
        onClick={togglePlay}
        className="flex h-7 w-7 items-center justify-center bg-primary text-white border border-foreground hover:translate-y-px active:translate-y-0.5 transition-transform"
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        {!compact && (
          <div className="flex justify-between font-bold uppercase tracking-tighter">
            <span>{isPlaying ? "Playing..." : "Voice Note"}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        )}
        <div 
          className="relative h-1.5 w-full bg-foreground/10 border border-foreground cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        {compact && (
           <div className="flex justify-between font-bold leading-none mt-0.5">
             <span>{formatTime(currentTime)}</span>
             <span>{formatTime(duration)}</span>
           </div>
        )}
      </div>

      {!compact && (
        <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
