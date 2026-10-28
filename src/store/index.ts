import { create } from 'zustand';
import { SimulationManager } from '../engine/SimulationManager';
import { baseScenario } from '../scenarios';
import { Action, SimulationState } from '../engine/types';

interface SimulationStore {
  managerA: SimulationManager;
  managerB: SimulationManager | null;
  activeTimeline: 'A' | 'B';
  isPlaying: boolean;
  playSpeed: number;

  // Computed states for UI reactivity
  stateA: SimulationState;
  stateB: SimulationState | null;

  // Actions
  togglePlay: () => void;
  stepForward: () => void;
  forkTimeline: () => void;
  switchTimeline: (timeline: 'A' | 'B') => void;
  injectEvent: (action: Action) => void;
}

const initialManager = new SimulationManager(baseScenario, 1337);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  managerA: initialManager,
  managerB: null,
  activeTimeline: 'A',
  isPlaying: false,
  playSpeed: 1000, // ms per tick

  stateA: initialManager.currentState,
  stateB: null,

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

  stepForward: () => {
    set(state => {
      // Step timeline A
      state.managerA.step(1);
      const nextStateA = state.managerA.currentState;

      // Step timeline B if it exists
      let nextStateB = state.stateB;
      if (state.managerB) {
        state.managerB.step(1);
        nextStateB = state.managerB.currentState;
      }

      return {
        managerA: state.managerA,
        managerB: state.managerB,
        stateA: nextStateA,
        stateB: nextStateB
      };
    });
  },

  forkTimeline: () => {
    set(state => {
      if (state.managerB) return state; // Already forked

      const currentTick = state.activeTimeline === 'A' ? state.stateA.tick : state.stateB!.tick;

      // Always fork from A for simplicity in this demo
      const forkedManager = state.managerA.fork(currentTick, 7331);

      if (!forkedManager) return state;

      return {
        managerB: forkedManager,
        stateB: forkedManager.currentState,
        activeTimeline: 'B' // Auto switch to new branch
      };
    });
  },

  switchTimeline: (timeline: 'A' | 'B') => {
    set({ activeTimeline: timeline });
  },

  injectEvent: (action: Action) => {
    set(state => {
      if (state.activeTimeline === 'A') {
        state.managerA.queueAction(action);
      } else if (state.managerB) {
        state.managerB.queueAction(action);
      }
      return {};
    });
  }
}));
