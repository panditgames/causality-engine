export type AgentId = string;
export type BusinessId = string;
export type EventId = string;

export interface Citizen {
  id: AgentId;
  name: string;
  employedAt: BusinessId | null;
  wealth: number;
  happiness: number;
  relationships: AgentId[]; // other citizen IDs
}

export interface Business {
  id: BusinessId;
  name: string;
  type: 'essential' | 'luxury' | 'services';
  isOpen: boolean;
  employees: AgentId[];
  funds: number;
  powerRequired: number;
}

export interface Resource {
  name: string;
  amount: number;
}

export interface Infrastructure {
  powerGridCapacity: number;
  powerGridDemand: number;
  transportEfficiency: number; // 0 to 1
}

export interface SimulationState {
  tick: number;
  citizens: Record<AgentId, Citizen>;
  businesses: Record<BusinessId, Business>;
  resources: Record<string, Resource>;
  infrastructure: Infrastructure;
  eventLog: EventRecord[];
}

export interface EventRecord {
  id: EventId;
  tick: number;
  type: string;
  description: string;
  causes: EventId[]; // IDs of events that directly caused this event
  affectedEntities: { type: 'citizen' | 'business' | 'infrastructure', id?: string }[];
}

export type ActionType =
  | { type: 'POWER_OUTAGE' }
  | { type: 'CLOSE_BUSINESS', businessId: BusinessId }
  | { type: 'OPEN_BUSINESS', business: Business }
  | { type: 'TRANSPORT_DELAY' }
  | { type: 'RESOURCE_SHOCK', resourceName: string, amount: number }
  | { type: 'REMOVE_WORKER', citizenId: AgentId };

export interface Action {
  type: ActionType;
  tick: number;
  causeId?: EventId; // What event (if any) caused this action (for internal cascading)
}
