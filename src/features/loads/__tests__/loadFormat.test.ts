import {
  badgeLabel,
  formatCurrency,
  formatPickupDate,
  formatPostedAgo,
  formatRatePerMile,
  formatWeight,
} from '../loadFormat';

describe('loadFormat', () => {
  it('formats currency with commas and no cents', () => {
    expect(formatCurrency(3800)).toBe('$3,800');
    expect(formatCurrency(1349.6)).toBe('$1,350');
  });

  it('formats rate per mile to two decimals', () => {
    expect(formatRatePerMile(3.176)).toBe('$3.18/mi');
  });

  it('formats weight with commas', () => {
    expect(formatWeight(40000)).toBe('40,000 lbs');
  });

  it('formats the pickup date without shifting a day', () => {
    expect(formatPickupDate('2026-10-23')).toBe('Fri 10/23');
    expect(formatPickupDate('2026-01-05')).toBe('Mon 01/05');
  });

  it('formats posted time in minutes and hours', () => {
    expect(formatPostedAgo(12)).toBe('12 min');
    expect(formatPostedAgo(60)).toBe('1 hr');
    expect(formatPostedAgo(125)).toBe('2 hr 5 min');
  });

  it('maps badges to display labels', () => {
    expect(badgeLabel('HIGH_OUTBOUND')).toBe('HIGH OUTBOUND');
    expect(badgeLabel('HIGH_RATE')).toBe('HIGH RATE');
  });
});