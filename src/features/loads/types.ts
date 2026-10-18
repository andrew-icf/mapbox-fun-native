export type LoadBadge = 'HIGH_OUTBOUND' | 'HIGH_RATE';

export type Location = { city: string; state: string };

export type Load = {
  id: string;
  carrier: string;
  badge: LoadBadge | null;
  origin: Location;
  destination: Location;
  pickupDate: string;
  rate: number;
  ratePerMile: number;
  miles: number;
  equipment: string;
  weightLbs: number;
  lengthFt: number;
  fullLoad: boolean;
  postedMinutesAgo: number;
};