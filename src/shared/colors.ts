export type DrawingColor = { hex: string; name: string };

// Ordered color choices for the map drawing palette picker.
// Index 0 is the default selected color for new drawings (matches today's hardcoded default).
export const drawingColors: DrawingColor[] = [
  { hex: '#2563eb', name: 'blue' }, // = colors.accent in theme.ts
  { hex: '#ef4444', name: 'red' },
  { hex: '#22c55e', name: 'green' }, // = colors.money in theme.ts
  { hex: '#eab308', name: 'amber' },
  { hex: '#5b21b6', name: 'purple' }, // = colors.badge in theme.ts
  { hex: '#06b6d4', name: 'teal' },
];

export function colorName(hex: string) {
  return drawingColors.find((c) => c.hex === hex)?.name ?? hex;
}
