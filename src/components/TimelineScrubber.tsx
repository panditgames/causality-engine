import React from 'react';
import { Play, Pause, SkipForward, GitBranch } from 'lucide-react';

interface TimelineScrubberProps {
  currentTick: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onFork: () => void;
  hasBranch: boolean;
  activeTimeline: 'A' | 'B';
  onSwitchTimeline: (timeline: 'A' | 'B') => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentTick,
  isPlaying,
  onPlayPause,
  onStepForward,
  onFork,
  hasBranch,
  activeTimeline,
  onSwitchTimeline
}) => {
  return (
    <div className="glass-panel p-4 flex items-center justify-between mt-4 mx-4 mb-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-[var(--color-neon-purple)] flex items-center justify-center text-white hover:bg-purple-600 transition-colors shadow-[0_0_10px_rgba(170,59,255,0.5)]"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>

        <button
          onClick={onStepForward}
          disabled={isPlaying}
          className="p-2 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
          title="Step Forward (1 Tick)"
        >
          <SkipForward size={20} />
        </button>

        <div className="font-mono text-xl ml-4">
          <span className="text-gray-500">TICK</span> {currentTick.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {hasBranch && (
          <div className="flex bg-black/50 rounded-lg p-1 border border-[var(--color-border-glass)]">
            <button
              onClick={() => onSwitchTimeline('A')}
              className={`px-3 py-1 text-sm font-bold rounded ${activeTimeline === 'A' ? 'bg-[var(--color-neon-purple)] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              PRIME
            </button>
            <button
              onClick={() => onSwitchTimeline('B')}
              className={`px-3 py-1 text-sm font-bold rounded ${activeTimeline === 'B' ? 'bg-[var(--color-neon-cyan)] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              BRANCH
            </button>
          </div>
        )}

        <button
          onClick={onFork}
          disabled={hasBranch}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-panel-glass)] border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] rounded hover:bg-[var(--color-neon-cyan)] hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-[var(--color-panel-glass)] disabled:hover:text-[var(--color-neon-cyan)]"
        >
          <GitBranch size={16} />
          <span>FORK TIMELINE</span>
        </button>
      </div>
    </div>
  );
};
