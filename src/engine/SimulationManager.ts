import { SimulationState, Action } from './types';
import { Simulator } from './simulator';

export class SimulationManager {
  private simulator: Simulator;

  // History of states for this timeline
  public history: SimulationState[] = [];

  // Current state
  public currentState: SimulationState;

  // Actions queued for future ticks
  public actionQueue: Record<number, Action[]> = {};

  constructor(initialState: SimulationState, seed: number = 42) {
    this.simulator = new Simulator(seed);
    this.currentState = JSON.parse(JSON.stringify(initialState));
    this.history.push(this.currentState);
  }

  // Progress simulation by n ticks
  public step(ticks: number = 1) {
    for (let i = 0; i < ticks; i++) {
      const currentTick = this.currentState.tick;
      const actionsForTick = this.actionQueue[currentTick] || [];

      const nextState = this.simulator.step(this.currentState, actionsForTick);

      this.history.push(nextState);
      this.currentState = nextState;

      // Cleanup processed actions
      delete this.actionQueue[currentTick];
    }
  }

  public queueAction(action: Action) {
    if (!this.actionQueue[action.tick]) {
      this.actionQueue[action.tick] = [];
    }
    this.actionQueue[action.tick].push(action);
  }

  // Create a new branch from a specific tick
  public fork(tick: number, seed: number = 42): SimulationManager | null {
    const forkState = this.history.find(s => s.tick === tick);
    if (!forkState) return null;

    const newManager = new SimulationManager(forkState, seed);

    // Copy the history up to the fork point
    newManager.history = this.history.filter(s => s.tick <= tick);

    // We could copy future actions, but typically a fork implies we want to change them.
    // For simplicity, we just copy actions that are scheduled for the fork point or later.
    for (const [t, actions] of Object.entries(this.actionQueue)) {
      if (parseInt(t) >= tick) {
        newManager.actionQueue[parseInt(t)] = [...actions];
      }
    }

    return newManager;
  }
}
