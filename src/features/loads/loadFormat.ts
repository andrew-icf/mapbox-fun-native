import type { LoadBadge } from './types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatCurrency(amount: number) {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatRatePerMile(rate: number) {
  return `$${rate.toFixed(2)}/mi`;
}

export function formatWeight(lbs: number) {
  return `${lbs.toLocaleString('en-US')} lbs`;
}

// Parse the date parts directly. new Date('2026-10-23') would be treated as
// UTC midnight, which shows as the previous day in US time zones.
export function formatPickupDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]} ${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

export function formatPostedAgo(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

const BADGE_LABELS: Record<LoadBadge, string> = {
  HIGH_OUTBOUND: 'HIGH OUTBOUND',
  HIGH_RATE: 'HIGH RATE',
};

export function badgeLabel(badge: LoadBadge) {
  return BADGE_LABELS[badge];
}