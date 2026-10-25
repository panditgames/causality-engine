import { SimulationState, Citizen, Business } from '../engine/types';

function generateBaseState(): SimulationState {
  const citizens: Record<string, Citizen> = {};
  const businesses: Record<string, Business> = {};

  // Create 100 citizens
  for (let i = 1; i <= 100; i++) {
    const id = `cit_${i}`;
    citizens[id] = {
      id,
      name: `Citizen ${i}`,
      employedAt: null,
      wealth: 100,
      happiness: 80,
      relationships: []
    };
  }

  // Create 5 businesses
  const bTypes: Business['type'][] = ['essential', 'essential', 'services', 'services', 'luxury'];

  for (let i = 1; i <= 5; i++) {
    const id = `biz_${i}`;
    businesses[id] = {
      id,
      name: `Business ${i} (${bTypes[i-1]})`,
      type: bTypes[i-1],
      isOpen: true,
      employees: [],
      funds: 1000,
      powerRequired: 10
    };
  }

  // Assign employees (15 per business = 75 employed, 25 unemployed initially)
  let citIndex = 1;
  for (const bId of Object.keys(businesses)) {
    for (let e = 0; e < 15; e++) {
      const cId = `cit_${citIndex}`;
      citizens[cId].employedAt = bId;
      businesses[bId].employees.push(cId);
      citIndex++;
    }
  }

  return {
    tick: 0,
    citizens,
    businesses,
    resources: {
      'Food': { name: 'Food', amount: 5000 },
      'Materials': { name: 'Materials', amount: 2000 }
    },
    infrastructure: {
      powerGridCapacity: 100,
      powerGridDemand: 0, // Will be calculated on tick
      transportEfficiency: 1.0
    },
    eventLog: []
  };
}

export const baseScenario = generateBaseState();
