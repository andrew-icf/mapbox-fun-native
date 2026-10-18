import type { Load } from '../features/loads/types';

// ratePerMile is computed by the resolver, so the raw data leaves it out
export type MockLoad = Omit<Load, 'ratePerMile'>;

export const mockLoads: MockLoad[] = [
  {
    id: '1', carrier: 'Summit Haulers', badge: 'HIGH_OUTBOUND',
    origin: { city: 'Madison', state: 'WI' }, destination: { city: 'Omaha', state: 'NE' },
    pickupDate: '2026-10-23', rate: 1350, miles: 425, equipment: 'V',
    weightLbs: 40000, lengthFt: 53, fullLoad: true, postedMinutesAgo: 12,
  },
  {
    id: '2', carrier: 'Prairie Line Freight', badge: 'HIGH_OUTBOUND',
    origin: { city: 'Chicago', state: 'IL' }, destination: { city: 'Green Bay', state: 'WI' },
    pickupDate: '2026-10-23', rate: 900, miles: 208, equipment: 'VR',
    weightLbs: 38000, lengthFt: 53, fullLoad: true, postedMinutesAgo: 38,
  },
  {
    id: '3', carrier: 'Ironwood Transport', badge: 'HIGH_RATE',
    origin: { city: 'Indianapolis', state: 'IN' }, destination: { city: 'Louisville', state: 'KY' },
    pickupDate: '2026-10-24', rate: 650, miles: 114, equipment: 'VR',
    weightLbs: 42000, lengthFt: 53, fullLoad: true, postedMinutesAgo: 2,
  },
  {
    id: '4', carrier: 'Redline Logistics', badge: 'HIGH_OUTBOUND',
    origin: { city: 'Chicago', state: 'IL' }, destination: { city: 'Denver', state: 'CO' },
    pickupDate: '2026-10-24', rate: 3800, miles: 1003, equipment: 'V',
    weightLbs: 44000, lengthFt: 53, fullLoad: true, postedMinutesAgo: 3,
  },
  {
    id: '5', carrier: 'Blue Ridge Carriers', badge: null,
    origin: { city: 'Milwaukee', state: 'WI' }, destination: { city: 'St. Louis', state: 'MO' },
    pickupDate: '2026-10-25', rate: 1100, miles: 362, equipment: 'F',
    weightLbs: 36000, lengthFt: 48, fullLoad: false, postedMinutesAgo: 55,
  },
  {
    id: '6', carrier: 'Northstar Freightways', badge: 'HIGH_RATE',
    origin: { city: 'Detroit', state: 'MI' }, destination: { city: 'Nashville', state: 'TN' },
    pickupDate: '2026-10-25', rate: 2100, miles: 535, equipment: 'V',
    weightLbs: 40000, lengthFt: 53, fullLoad: true, postedMinutesAgo: 20,
  },
];