import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox, { type Camera } from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import * as Location from 'expo-location';
import type { Feature, FeatureCollection, LineString, Polygon, Position } from 'geojson';
import CountryInfo, { type Country } from './CountryInfo';

type DrawMode = 'line' | 'polygon';
type DrawingProps = { lineColor: string; fillColor: string };
type Drawing = Feature<LineString | Polygon, DrawingProps>;

const COLORS: DrawingProps = { lineColor: '#2563eb', fillColor: '#2563eb' };
const PREVIEW_COLOR = '#f97316';
const STORAGE_KEY = 'user_drawings';

export default function DrawMap() {
  const [mode, setMode] = useState<DrawMode>('polygon');
  const [points, setPoints] = useState<Position[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [hasLocation, setHasLocation] = useState(false);

  // Ask for location permission once on mount
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      const granted = status === 'granted';
      setHasLocation(granted);
      if (granted) flyToMe();
    });
  }, []);

  const flyToMe = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 14,
        animationDuration: 1500,
        animationMode: 'flyTo',
      });
    } catch (error) {
      console.warn('Could not get location', error);
    }
  };

  const flyToCountry = (country: Country) => {
    cameraRef.current?.setCamera({
      centerCoordinate: country.center,
      zoomLevel: country.zoom,
      animationDuration: 1500,
      animationMode: 'flyTo',
    });
  };

  // Load saved drawings once when the component mounts
  useEffect(() => {
  AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
      if (saved) setDrawings(JSON.parse(saved));
     })
      .catch((error) => console.warn('Failed to load drawings', error))
      .finally(() => setLoaded(true));
  }, []);

  // Save whenever drawings change, but only after the initial load
  useEffect(() => {
  if (!loaded) return;
  const save = drawings.length
      ? AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(drawings))
      : AsyncStorage.removeItem(STORAGE_KEY);
  save.catch((error) => console.warn('Failed to save drawings', error));
  }, [drawings, loaded]);

  const minPoints = mode === 'line' ? 2 : 3;
  const canFinish = points.length >= minPoints;

  // Each tap on the map adds a point to the shape in progress
  const handleMapPress = (feature: Feature) => {
    const { geometry } = feature;
    if (geometry?.type !== 'Point') return;
    setPoints((prev) => [...prev, geometry.coordinates]);
  };

  const changeMode = (next: DrawMode) => {
    setMode(next);
    setPoints([]);
  };

  const finishShape = () => {
    if (!canFinish) return;
    const drawing: Drawing =
      mode === 'line'
        ? turf.lineString(points, COLORS)
        : turf.polygon([[...points, points[0]]], COLORS); // polygons must close the ring
    setDrawings((prev) => [...prev, drawing]);
    setPoints([]);
  };

  const undoPoint = () => setPoints((prev) => prev.slice(0, -1));

  const clearAll = () => {
    setPoints([]);
    setDrawings([]);
  };

  // Everything the map should render: finished shapes plus the shape in progress
  const shape = useMemo<FeatureCollection>(() => {
    const features: Feature[] = [...drawings];
    if (points.length >= 2) features.push(turf.lineString(points));
    points.forEach((p) => features.push(turf.point(p)));
    return turf.featureCollection(features);
  }, [drawings, points]);

  // Measurements, carried over from the web version
  const totals = useMemo(() => {
    const polygons = drawings.filter((d) => d.geometry.type === 'Polygon');
    const lines = drawings.filter((d) => d.geometry.type === 'LineString');
    const area = turf.area(turf.featureCollection(polygons));
    const miles = lines.reduce((sum, l) => sum + turf.length(l, { units: 'miles' }), 0);
    return { area, miles };
  }, [drawings]);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} onPress={handleMapPress}>
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{ zoomLevel: 12, centerCoordinate: [-104.99, 39.74] }}
        />
        {hasLocation && <Mapbox.LocationPuck />}
        <Mapbox.ShapeSource id="drawings" shape={shape}>
          <Mapbox.FillLayer
            id="drawings-fill"
            filter={['==', ['geometry-type'], 'Polygon']}
            style={{ fillColor: ['get', 'fillColor'], fillOpacity: 0.3 }}
          />
          <Mapbox.LineLayer
            id="drawings-line"
            filter={['!=', ['geometry-type'], 'Point']}
            style={{ lineColor: ['coalesce', ['get', 'lineColor'], PREVIEW_COLOR], lineWidth: 3 }}
          />
          <Mapbox.CircleLayer
            id="drawings-points"
            filter={['==', ['geometry-type'], 'Point']}
            style={{
              circleRadius: 6,
              circleColor: PREVIEW_COLOR,
              circleStrokeColor: '#ffffff',
              circleStrokeWidth: 2,
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>

      <View style={styles.toolbar} pointerEvents="box-none">
        <ToolbarButton label="Line" active={mode === 'line'} onPress={() => changeMode('line')} />
        <ToolbarButton label="Polygon" active={mode === 'polygon'} onPress={() => changeMode('polygon')} />
        <ToolbarButton label="Undo" disabled={points.length === 0} onPress={undoPoint} />
        <ToolbarButton label="Finish" disabled={!canFinish} onPress={finishShape} />
        <ToolbarButton label="Clear" onPress={clearAll} />
        <ToolbarButton label="Me" disabled={!hasLocation} onPress={flyToMe} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelText}>
          {points.length > 0
            ? `Tap to add points (${points.length} so far)`
            : `Tap the map to start a ${mode}`}
        </Text>
        <Text style={styles.panelValue}>{(totals.area / 2_589_988).toFixed(2)} sq miles</Text>
        <Text style={styles.panelValue}>{totals.miles.toFixed(2)} miles of lines</Text>
        <CountryInfo onSelectCountry={flyToCountry} />
      </View>
    </View>
  );
}

type ToolbarButtonProps = {
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
};

function ToolbarButton({ label, onPress, active, disabled }: ToolbarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, active && styles.buttonActive, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, active && styles.buttonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  toolbar: {
    position: 'absolute',
    top: 70,
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonActive: { backgroundColor: '#2563eb' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  buttonTextActive: { color: '#ffffff' },
  panel: {
    position: 'absolute',
    bottom: 40,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 14,
  },
  panelText: { fontSize: 13, color: '#4b5563', marginBottom: 6 },
  panelValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
});