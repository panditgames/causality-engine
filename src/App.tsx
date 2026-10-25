import React, { useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { SplitUniverseView } from './components/SplitUniverseView';
import { TimelineScrubber } from './components/TimelineScrubber';
import { CausalGraph } from './components/CausalGraph';
import { EventInjector } from './components/EventInjector';
import { useSimulationStore } from './store';
import { EventRecord } from './engine/types';
import './App.css';

function App() {
  const {
    stateA,
    stateB,
    activeTimeline,
    isPlaying,
    togglePlay,
    stepForward,
    forkTimeline,
    switchTimeline,
    injectEvent
  } = useSimulationStore();

  // Playback loop
  useEffect(() => {
    let intervalId: number;
    if (isPlaying) {
      intervalId = window.setInterval(() => {
        stepForward();
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, stepForward]);

  const currentState = activeTimeline === 'A' ? stateA : stateB!;

  // Memoize data for event injector
  const businessesList = useMemo(() => {
    return Object.values(currentState.businesses).map(b => ({ id: b.id, name: b.name }));
  }, [currentState.businesses]);

  const citizensList = useMemo(() => {
    return Object.values(currentState.citizens).map(c => ({ id: c.id, name: c.name }));
  }, [currentState.citizens]);

  // Combine events for the graph
  const allEvents = useMemo(() => {
    // If no branch, just return A's events
    if (!stateB) return stateA.eventLog;

    // If branched, we show events up to fork point, then branch out visually
    // For simplicity in this ReactFlow setup, we'll just show the active timeline's full history
    // A true split graph is complex to render in 2D, so we toggle based on active timeline
    return currentState.eventLog;
  }, [stateA.eventLog, stateB?.eventLog, currentState.eventLog, activeTimeline]);

  return (
    <Dashboard>
      {/* Left Column: Visualizations & Controls */}
      <div className="w-2/3 flex flex-col gap-4">
        {/* Split View */}
        <div className="h-[40%]">
          <SplitUniverseView
            timelineA={stateA}
            timelineB={stateB}
            activeTimeline={activeTimeline}
          />
        </div>

        {/* Scrubber */}
        <TimelineScrubber
          currentTick={currentState.tick}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onStepForward={stepForward}
          onFork={forkTimeline}
          hasBranch={stateB !== null}
          activeTimeline={activeTimeline}
          onSwitchTimeline={switchTimeline}
        />

        {/* Causal Graph */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 rounded border border-[var(--color-border-glass)] text-xs text-gray-400 z-10">
            CAUSAL CHAIN LOG ({activeTimeline === 'A' ? 'PRIME' : 'BRANCH'})
          </div>
          <CausalGraph events={allEvents} />
        </div>
      </div>

      {/* Right Column: Event Injection */}
      <div className="w-1/3 flex flex-col gap-4">
        <EventInjector
          onInject={injectEvent}
          businesses={businessesList}
          citizens={citizensList}
          currentTick={currentState.tick}
        />

        {/* Context / Instructions Panel */}
        <div className="glass-panel p-4 flex-1">
          <h3 className="text-[var(--color-neon-cyan)] font-bold text-sm mb-3">SIMULATION CONTEXT</h3>
          <p className="text-sm text-gray-400 mb-4">
            Welcome to CAUSALITY. This engine simulates a deterministic micro-world of interconnected agents and businesses.
          </p>
          <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
            <li>Press <strong className="text-white">Play</strong> to watch the economy tick forward organically.</li>
            <li>Use the <strong className="text-[var(--color-neon-purple)]">Event Injection Matrix</strong> to introduce anomalous events into the system.</li>
            <li>Watch how a single event cascades through the network, causing unexpected secondary effects (e.g., job losses leading to happiness drops).</li>
            <li>Click <strong className="text-[var(--color-neon-cyan)]">Fork Timeline</strong> to split the universe, make a different choice, and compare the outcomes side-by-side.</li>
          </ul>
        </div>
      </div>
    </Dashboard>
  );
}

export default App;
