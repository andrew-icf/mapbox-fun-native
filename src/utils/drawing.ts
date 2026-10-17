import * as turf from '@turf/turf';
import type { Feature, LineString, Polygon, Position } from 'geojson';

export type DrawMode = 'line' | 'polygon';
export type DrawingProps = { lineColor: string; fillColor: string };
export type Drawing = Feature<LineString | Polygon, DrawingProps>;

export const SQ_METERS_PER_SQ_MILE = 2_589_988;

export function minPointsFor(mode: DrawMode) {
  return mode === 'line' ? 2 : 3;
}

export function createDrawing(
  mode: DrawMode,
  points: Position[],
  props: DrawingProps
): Drawing | null {
  if (points.length < minPointsFor(mode)) return null;
  return mode === 'line'
    ? turf.lineString(points, props)
    : turf.polygon([[...points, points[0]]], props); // close the ring
}

export function computeTotals(drawings: Drawing[]) {
  const polygons = drawings.filter((d) => d.geometry.type === 'Polygon');
  const lines = drawings.filter((d) => d.geometry.type === 'LineString');
  const sqMiles = turf.area(turf.featureCollection(polygons)) / SQ_METERS_PER_SQ_MILE;
  const miles = lines.reduce((sum, l) => sum + turf.length(l, { units: 'miles' }), 0);
  return { sqMiles, miles };
}