import React, { useState } from 'react';
import { Action, BusinessId, AgentId } from '../engine/types';

interface EventInjectorProps {
  onInject: (action: Action) => void;
  businesses: { id: BusinessId; name: string }[];
  citizens: { id: AgentId; name: string }[];
  currentTick: number;
}

export const EventInjector: React.FC<EventInjectorProps> = ({
  onInject,
  businesses,
  citizens,
  currentTick
}) => {
  const [selectedEventType, setSelectedEventType] = useState<string>('POWER_OUTAGE');
  const [targetId, setTargetId] = useState<string>('');

  const handleInject = () => {
    // We inject the event 1 tick into the future
    const targetTick = currentTick + 1;

    let action: Action | null = null;

    switch (selectedEventType) {
      case 'POWER_OUTAGE':
        action = { type: { type: 'POWER_OUTAGE' }, tick: targetTick };
        break;
      case 'CLOSE_BUSINESS':
        if (targetId) {
          action = { type: { type: 'CLOSE_BUSINESS', businessId: targetId }, tick: targetTick };
        }
        break;
      case 'REMOVE_WORKER':
        if (targetId) {
          action = { type: { type: 'REMOVE_WORKER', citizenId: targetId }, tick: targetTick };
        }
        break;
    }

    if (action) {
      onInject(action);
      // Reset target if needed
      setTargetId('');
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <h3 className="text-[var(--color-neon-purple)] font-bold text-sm">EVENT INJECTION MATRIX</h3>

      <div className="flex gap-2">
        <select
          className="bg-black/50 border border-[var(--color-border-glass)] text-white p-2 rounded text-sm flex-1"
          value={selectedEventType}
          onChange={(e) => {
            setSelectedEventType(e.target.value);
            setTargetId('');
          }}
        >
          <option value="POWER_OUTAGE">Citywide Power Outage</option>
          <option value="CLOSE_BUSINESS">Unexpected Business Closure</option>
          <option value="REMOVE_WORKER">The Missing Worker</option>
        </select>

        {selectedEventType === 'CLOSE_BUSINESS' && (
          <select
            className="bg-black/50 border border-[var(--color-border-glass)] text-white p-2 rounded text-sm flex-1"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="" disabled>Select Target</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        {selectedEventType === 'REMOVE_WORKER' && (
          <select
            className="bg-black/50 border border-[var(--color-border-glass)] text-white p-2 rounded text-sm flex-1"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="" disabled>Select Target</option>
            {citizens.slice(0, 15).map(c => ( // Just show a few for UI simplicity
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleInject}
          disabled={!selectedEventType || (selectedEventType !== 'POWER_OUTAGE' && !targetId)}
          className="bg-[var(--color-neon-purple)] text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          INJECT
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Note: Events are scheduled for the next simulation tick.
      </div>
    </div>
  );
};
