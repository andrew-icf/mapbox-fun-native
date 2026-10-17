import type { Polygon } from 'geojson';
import { computeTotals, createDrawing } from '../drawing';

const props = { lineColor: '#000000', fillColor: '#000000' };

describe('createDrawing', () => {
  it('returns null when there are not enough points', () => {
    expect(createDrawing('line', [[0, 0]], props)).toBeNull();
    expect(createDrawing('polygon', [[0, 0], [1, 1]], props)).toBeNull();
  });

  it('closes the polygon ring', () => {
    const drawing = createDrawing('polygon', [[0, 0], [1, 0], [1, 1]], props)!;
    const ring = (drawing.geometry as Polygon).coordinates[0];
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });
});

describe('computeTotals', () => {
  it('returns zeros when there are no drawings', () => {
    expect(computeTotals([])).toEqual({ sqMiles: 0, miles: 0 });
  });

  it('measures one degree of latitude as about 69 miles', () => {
    const line = createDrawing('line', [[-105, 39], [-105, 40]], props)!;
    expect(computeTotals([line]).miles).toBeCloseTo(69, 0);
  });
});