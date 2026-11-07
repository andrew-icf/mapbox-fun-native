import { colorName } from '../colors';

describe('colorName', () => {
  it('returns the matching palette name', () => {
    expect(colorName('#2563eb')).toBe('blue');
  });

  it('falls back to the hex value for an unknown color', () => {
    expect(colorName('#000000')).toBe('#000000');
  });
});
