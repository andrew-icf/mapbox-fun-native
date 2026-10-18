import type { Load } from '../features/loads/types';

// A complete, valid default mock load for testing. Tests override only the fields they care about.
export function makeLoad(overrides: Partial<Load> = {}): Load {
  return {
    id: '1',
    carrier: 'Test Carrier',
    badge: 'HIGH_RATE',
    origin: { city: 'Chicago', state: 'IL' },
    destination: { city: 'Denver', state: 'CO' },
    pickupDate: '2026-10-23',
    rate: 2000,
    ratePerMile: 2,
    miles: 1000,
    equipment: 'V',
    weightLbs: 40000,
    lengthFt: 53,
    fullLoad: true,
    postedMinutesAgo: 5,
    ...overrides,
  };
}

// Apollo's cache expects __typename on every object in mocked responses
export function withTypenames(load: Load) {
  return {
    __typename: 'Load',
    ...load,
    origin: { __typename: 'Location', ...load.origin },
    destination: { __typename: 'Location', ...load.destination },
  };
}