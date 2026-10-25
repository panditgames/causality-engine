import React from 'react';
import { SimulationState } from '../engine/types';

interface MetricProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, subValue, color = 'text-white' }) => (
  <div className="glass-panel p-3">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className={`text-xl font-mono ${color}`}>{value}</div>
    {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
  </div>
);

interface UniversePanelProps {
  title: string;
  state: SimulationState;
  isActive: boolean;
}

const UniversePanel: React.FC<UniversePanelProps> = ({ title, state, isActive }) => {
  const citizensCount = Object.keys(state.citizens).length;
  const employedCount = Object.values(state.citizens).filter(c => c.employedAt).length;
  const employmentRate = citizensCount > 0 ? (employedCount / citizensCount * 100).toFixed(1) : 0;

  const avgWealth = citizensCount > 0 ?
    (Object.values(state.citizens).reduce((sum, c) => sum + c.wealth, 0) / citizensCount).toFixed(1) : 0;

  const avgHappiness = citizensCount > 0 ?
    (Object.values(state.citizens).reduce((sum, c) => sum + c.happiness, 0) / citizensCount).toFixed(1) : 0;

  const openBusinesses = Object.values(state.businesses).filter(b => b.isOpen).length;
  const totalBusinesses = Object.keys(state.businesses).length;

  return (
    <div className={`flex-1 flex flex-col gap-4 p-4 glass-panel ${isActive ? 'border-[var(--color-neon-purple)] shadow-[0_0_15px_rgba(170,59,255,0.2)]' : 'opacity-70'}`}>
      <h2 className="text-xl font-bold text-[var(--color-neon-cyan)] mb-2 flex items-center justify-between">
        {title}
        <span className="text-sm font-mono bg-[var(--color-border-glass)] px-2 py-1 rounded">TICK {state.tick}</span>
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="EMPLOYMENT"
          value={`${employmentRate}%`}
          subValue={`${employedCount} / ${citizensCount} employed`}
        />
        <Metric
          label="BUSINESSES"
          value={`${openBusinesses} / ${totalBusinesses}`}
          subValue="Active Operations"
        />
        <Metric
          label="AVG WEALTH"
          value={`$${avgWealth}`}
          color="text-green-400"
        />
        <Metric
          label="AVG HAPPINESS"
          value={`${avgHappiness}%`}
          color={Number(avgHappiness) > 50 ? 'text-blue-400' : 'text-red-400'}
        />
      </div>

      <div className="mt-4 flex-1 glass-panel p-3 overflow-y-auto">
        <h3 className="text-sm text-gray-400 mb-2">RECENT EVENTS</h3>
        <div className="flex flex-col gap-2">
          {state.eventLog.slice(-5).reverse().map((event, idx) => (
            <div key={idx} className="text-sm font-mono border-l-2 border-[var(--color-neon-purple)] pl-2">
              <span className="text-gray-500 mr-2">[{event.tick}]</span>
              {event.description}
            </div>
          ))}
          {state.eventLog.length === 0 && (
            <div className="text-sm text-gray-600 italic">No events recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SplitUniverseViewProps {
  timelineA: SimulationState;
  timelineB: SimulationState | null;
  activeTimeline: 'A' | 'B';
}

export const SplitUniverseView: React.FC<SplitUniverseViewProps> = ({ timelineA, timelineB, activeTimeline }) => {
  return (
    <div className="flex gap-4 w-full h-full">
      <UniversePanel title="TIMELINE A (PRIME)" state={timelineA} isActive={activeTimeline === 'A'} />
      {timelineB ? (
        <UniversePanel title="TIMELINE B (BRANCH)" state={timelineB} isActive={activeTimeline === 'B'} />
      ) : (
        <div className="flex-1 flex items-center justify-center glass-panel border-dashed opacity-50">
          <div className="text-center text-gray-500">
            <p className="mb-2">No active branch.</p>
            <p className="text-xs">Fork the timeline to compare outcomes.</p>
          </div>
        </div>
      )}
    </div>
  );
};
