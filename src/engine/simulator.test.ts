import { describe, it, expect } from 'vitest';
import { Simulator, generateId } from './simulator';
import { SimulationManager } from './SimulationManager';
import { baseScenario } from '../scenarios';

describe('Deterministic Simulator', () => {
  it('should produce identical states for the same seed', () => {
    const sim1 = new Simulator(42);
    const sim2 = new Simulator(42);

    // We only test that the random output is identical
    const state1 = sim1.step(baseScenario, []);
    const state2 = sim2.step(baseScenario, []);

    expect(state1).toEqual(state2);
  });

  it('should process events correctly', () => {
    const sim = new Simulator(42);
    const actionQueue = [{ type: { type: 'POWER_OUTAGE' as const }, tick: 1 }];

    const state = sim.step(baseScenario, actionQueue);

    expect(state.infrastructure.powerGridCapacity).toBe(0);
    // Base scenario businesses should be closed due to power outage
    const openBusinesses = Object.values(state.businesses).filter(b => b.isOpen);
    expect(openBusinesses.length).toBe(0);

    // Should have logged events
    expect(state.eventLog.length).toBeGreaterThan(0);
    expect(state.eventLog.find(e => e.type === 'POWER_OUTAGE')).toBeDefined();
  });
});

describe('Simulation Manager', () => {
  it('should handle timeline forks in isolation', () => {
    const managerA = new SimulationManager(baseScenario, 100);
    managerA.step(2);

    // Fork at tick 2
    const managerB = managerA.fork(2, 200);

    expect(managerB).not.toBeNull();
    if (!managerB) return;

    expect(managerA.currentState).toEqual(managerB.currentState);

    // Inject event only into B
    managerB.queueAction({ type: { type: 'POWER_OUTAGE' }, tick: 3 });

    managerA.step(2); // Goes to tick 4
    managerB.step(2); // Goes to tick 4

    // A should have power, B should not
    expect(managerA.currentState.infrastructure.powerGridCapacity).toBeGreaterThan(0);
    expect(managerB.currentState.infrastructure.powerGridCapacity).toBe(0);
  });
});
