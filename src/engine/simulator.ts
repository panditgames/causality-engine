import { SimulationState, Action, EventRecord, EventId, BusinessId, ActionType } from './types';

// Simple seeded PRNG
export class PRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns a float between 0 and 1
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Returns integer between min and max (inclusive)
  nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export class Simulator {
  private prng: PRNG;

  constructor(seed: number = 42) {
    this.prng = new PRNG(seed);
  }

  // Processes one tick of the simulation
  step(state: SimulationState, actionQueue: Action[]): SimulationState {
    // We do a deep copy to ensure immutability
    const nextState: SimulationState = JSON.parse(JSON.stringify(state));
    nextState.tick += 1;

    // Process external actions and immediate consequences
    const newEvents: EventRecord[] = [];

    // 1. Apply Actions
    for (const action of actionQueue) {
       this.applyAction(nextState, action, newEvents);
    }

    // 2. Natural Tick Progression (Income, Happiness decay, etc.)
    this.processEconomy(nextState, newEvents);

    // 3. Update event log
    nextState.eventLog.push(...newEvents);

    return nextState;
  }

  private applyAction(state: SimulationState, action: Action, newEvents: EventRecord[]) {
    const eventId = `evt_${state.tick}_${generateId()}`;
    const type = action.type.type;

    let description = '';
    const affectedEntities: EventRecord['affectedEntities'] = [];
    const causes = action.causeId ? [action.causeId] : [];

    switch (type) {
      case 'POWER_OUTAGE':
        state.infrastructure.powerGridCapacity = 0;
        description = 'A citywide power outage occurred.';
        affectedEntities.push({ type: 'infrastructure' });

        // Consequence: all businesses close if they don't have backup
        Object.values(state.businesses).forEach(biz => {
          if (biz.isOpen) {
            biz.isOpen = false;
            // Internal cascading event
            newEvents.push({
              id: `evt_${state.tick}_${generateId()}`,
              tick: state.tick,
              type: 'BUSINESS_CLOSED_POWER',
              description: `${biz.name} closed due to lack of power.`,
              causes: [eventId],
              affectedEntities: [{ type: 'business', id: biz.id }]
            });
          }
        });
        break;

      case 'CLOSE_BUSINESS':
        const bid = (action.type as any).businessId;
        const bizToClose = state.businesses[bid];
        if (bizToClose && bizToClose.isOpen) {
          bizToClose.isOpen = false;
          description = `${bizToClose.name} unexpectedly closed down.`;
          affectedEntities.push({ type: 'business', id: bid });

          // Consequence: Employees lose jobs
          bizToClose.employees.forEach(empId => {
            const emp = state.citizens[empId];
            if (emp) {
              emp.employedAt = null;
              newEvents.push({
                id: `evt_${state.tick}_${generateId()}`,
                tick: state.tick,
                type: 'JOB_LOST',
                description: `${emp.name} lost their job at ${bizToClose.name}.`,
                causes: [eventId],
                affectedEntities: [{ type: 'citizen', id: empId }]
              });
            }
          });
          bizToClose.employees = [];
        }
        break;

      case 'REMOVE_WORKER':
        const cid = (action.type as any).citizenId;
        const citizen = state.citizens[cid];
        if (citizen) {
          const bizId = citizen.employedAt;
          if (bizId) {
             const biz = state.businesses[bizId];
             if (biz) {
                biz.employees = biz.employees.filter(e => e !== cid);
                citizen.employedAt = null;
                description = `${citizen.name} stopped going to work at ${biz.name}.`;
                affectedEntities.push({ type: 'citizen', id: cid }, { type: 'business', id: bizId });

                // If business loses too many employees, it might close
                if (biz.employees.length === 0 && biz.isOpen) {
                    newEvents.push({
                        id: `evt_${state.tick}_${generateId()}`,
                        tick: state.tick,
                        type: 'BUSINESS_CLOSED_STAFF',
                        description: `${biz.name} closed due to lack of staff.`,
                        causes: [eventId],
                        affectedEntities: [{ type: 'business', id: biz.id }]
                    });
                    biz.isOpen = false;
                }
             }
          }
        }
        break;

       // Add more actions as needed
       default:
        break;
    }

    if (description) {
      newEvents.push({
        id: eventId,
        tick: state.tick,
        type,
        description,
        causes,
        affectedEntities
      });
    }
  }

  private processEconomy(state: SimulationState, newEvents: EventRecord[]) {
    // Simple economy tick

    // Recalculate power demand
    let currentPowerDemand = 0;

    Object.values(state.businesses).forEach(biz => {
      if (biz.isOpen) {
        currentPowerDemand += biz.powerRequired;

        // Pay employees
        biz.employees.forEach(empId => {
          const emp = state.citizens[empId];
          if (emp) {
            emp.wealth += 10; // Fixed wage for simplicity
            biz.funds -= 10;
          }
        });

        // Earn revenue
        biz.funds += biz.employees.length * 15;
      }
    });

    state.infrastructure.powerGridDemand = currentPowerDemand;

    // Unemployed citizens lose happiness and wealth
    Object.values(state.citizens).forEach(cit => {
      if (!cit.employedAt) {
        cit.wealth -= 2; // Living expenses
        cit.happiness = Math.max(0, cit.happiness - 1);
      } else {
        cit.happiness = Math.min(100, cit.happiness + 1);
      }

      // Cascading effect of low wealth
      if (cit.wealth < 0 && cit.happiness > 50) {
        cit.happiness -= 5;
        // Maybe log an event if happiness drops significantly?
      }
    });
  }
}
