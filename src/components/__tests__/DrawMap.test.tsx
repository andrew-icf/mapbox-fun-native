import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import DrawMap from '../DrawMap';
import { drawingColors } from '../../shared/colors';

// Replace CountryInfo with a stand-in, so this test checks drawing and color
// selection only, not the country GraphQL lookup (which needs an Apollo client).
// The stand-in's "Pick US" button calls onSelectCountry with the real US entry,
// so tests can check that picking a country moves the camera.
jest.mock('../CountryInfo', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  const { COUNTRIES } = jest.requireActual('../CountryInfo');
  const us = COUNTRIES.find((c: { code: string }) => c.code === 'US');
  return {
    __esModule: true,
    default: ({ onSelectCountry }: { onSelectCountry: (c: unknown) => void }) =>
      React.createElement(
        Pressable,
        { onPress: () => onSelectCountry(us) },
        React.createElement(Text, null, 'Pick US')
      ),
  };
});

// The real @rnmapbox/maps types don't declare this extra mock-only export.
const { __shapeSourceSpy: shapeSourceSpy, __setCameraSpy: setCameraSpy } = Mapbox as unknown as {
  __shapeSourceSpy: jest.Mock;
  __setCameraSpy: jest.Mock;
};
const requestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;

const DEFAULT_COLOR = drawingColors[0].hex; // blue
const RED = drawingColors[1].hex;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

let warnSpy: jest.SpyInstance;
beforeEach(() => {
  // The failure paths log with console.warn; silence it so tests can assert on it.
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warnSpy.mockRestore());

const lastShape = () => shapeSourceSpy.mock.calls.at(-1)?.[0];
const countPoints = () => lastShape().features.filter((f: any) => f.geometry.type === 'Point').length;

async function tapMap(times: number) {
  for (let i = 0; i < times; i++) await fireEvent.press(screen.getByTestId('map-view'));
}

// DrawMap's mount effect kicks off an AsyncStorage.getItem() that later calls
// setDrawings/setLoaded once it resolves. render() alone doesn't wait for that
// chain to settle, so a later test can see it resolve at the wrong moment and
// trip React's "overlapping act()" warnings. waitFor flushes pending work
// inside its own act() scope, so waiting on the call that already happened
// still lets the resulting state updates land before the test continues.
async function renderDrawMap() {
  const utils = await render(<DrawMap />);
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
  return utils;
}

describe('DrawMap palette', () => {
  it('shows a swatch for every palette color, with the default selected', async () => {
    await renderDrawMap();

    const swatches = screen.getAllByTestId(/^color-swatch-/);
    expect(swatches.length).toBe(drawingColors.length);

    const defaultSwatch = screen.getByTestId(`color-swatch-${DEFAULT_COLOR.replace('#', '')}`);
    expect(defaultSwatch.props.accessibilityState.selected).toBe(true);

    const others = swatches.filter((s) => s !== defaultSwatch);
    others.forEach((swatch) => expect(swatch.props.accessibilityState.selected).toBe(false));
  });

  it('changes which swatch is selected when tapped', async () => {
    await renderDrawMap();

    const defaultSwatch = screen.getByTestId(`color-swatch-${DEFAULT_COLOR.replace('#', '')}`);
    const redSwatch = screen.getByTestId(`color-swatch-${RED.replace('#', '')}`);

    await fireEvent.press(redSwatch);

    expect(redSwatch.props.accessibilityState.selected).toBe(true);
    expect(defaultSwatch.props.accessibilityState.selected).toBe(false);
  });
});

describe('DrawMap new drawings', () => {
  it('uses the selected color for both lineColor and fillColor', async () => {
    await renderDrawMap();

    await fireEvent.press(screen.getByTestId(`color-swatch-${RED.replace('#', '')}`));
    await fireEvent.press(screen.getByText('Line'));
    await fireEvent.press(screen.getByTestId('map-view'));
    await fireEvent.press(screen.getByTestId('map-view'));
    await fireEvent.press(screen.getByTestId('finish-button'));

    const lastShape = shapeSourceSpy.mock.calls.at(-1)?.[0];
    const line = lastShape.features.find((f: any) => f.geometry.type === 'LineString');
    expect(line.properties.lineColor).toBe(RED);
    expect(line.properties.fillColor).toBe(RED);
  });

  it('keeps a saved drawing in its original color after a restart, even if the selection changes', async () => {
    const first = await renderDrawMap();

    // Draw and finish a polygon with the default color
    await fireEvent.press(screen.getByTestId('map-view'));
    await fireEvent.press(screen.getByTestId('map-view'));
    await fireEvent.press(screen.getByTestId('map-view'));
    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());

    await first.unmount();

    await renderDrawMap();

    // The restart's load resolves asynchronously; wait for the restored
    // polygon to actually reach ShapeSource before moving on.
    await waitFor(() => {
      const shape = shapeSourceSpy.mock.calls.at(-1)?.[0];
      expect(shape?.features?.some((f: any) => f.geometry.type === 'Polygon')).toBe(true);
    });

    // Change the live selection in the new instance; this must not affect the already-saved shape
    await fireEvent.press(screen.getByTestId(`color-swatch-${RED.replace('#', '')}`));

    const lastShape = shapeSourceSpy.mock.calls.at(-1)?.[0];
    const polygon = lastShape.features.find((f: any) => f.geometry.type === 'Polygon');
    expect(polygon.properties.lineColor).toBe(DEFAULT_COLOR);
    expect(polygon.properties.fillColor).toBe(DEFAULT_COLOR);
  });
});

describe('DrawMap save-color hint', () => {
  it('shows the default color before any points are added', async () => {
    await renderDrawMap();

    expect(screen.getByText('Tap the map to start a polygon. Saves in blue')).toBeOnTheScreen();
    expect(screen.getByTestId('pending-color-swatch').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: DEFAULT_COLOR })])
    );
  });

  it('updates after picking a different color and adding points', async () => {
    await renderDrawMap();

    await fireEvent.press(screen.getByTestId(`color-swatch-${RED.replace('#', '')}`));
    await fireEvent.press(screen.getByText('Line'));
    await fireEvent.press(screen.getByTestId('map-view'));

    expect(screen.getByText('Tap to add points (1 so far). Saves in red')).toBeOnTheScreen();
    expect(screen.getByTestId('pending-color-swatch').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: RED })])
    );
  });
});

describe('DrawMap location', () => {
  it("flies to the user's location on mount when permission is granted", async () => {
    requestPermission.mockResolvedValueOnce({ status: 'granted' });
    getPosition.mockResolvedValueOnce({ coords: { latitude: 40, longitude: -105 } });

    await renderDrawMap();

    await waitFor(() =>
      expect(setCameraSpy).toHaveBeenCalledWith(
        expect.objectContaining({ centerCoordinate: [-105, 40], zoomLevel: 14 })
      )
    );
    expect(screen.getByText('Me')).toBeEnabled();
  });

  it('flies to the user again when Me is pressed', async () => {
    requestPermission.mockResolvedValueOnce({ status: 'granted' });
    getPosition
      .mockResolvedValueOnce({ coords: { latitude: 41, longitude: -106 } })
      .mockResolvedValueOnce({ coords: { latitude: 41, longitude: -106 } });
    await renderDrawMap();
    await waitFor(() => expect(setCameraSpy).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByText('Me'));

    await waitFor(() => expect(setCameraSpy).toHaveBeenCalledTimes(2));
    expect(setCameraSpy).toHaveBeenLastCalledWith(expect.objectContaining({ centerCoordinate: [-106, 41] }));
  });

  it("keeps the map in place and warns when the location can't be read", async () => {
    requestPermission.mockResolvedValueOnce({ status: 'granted' });
    getPosition.mockRejectedValueOnce(new Error('GPS off'));

    await renderDrawMap();

    await waitFor(() => expect(warnSpy).toHaveBeenCalledWith('Could not get location', expect.any(Error)));
    expect(setCameraSpy).not.toHaveBeenCalled();
  });

  it('disables Me and never reads the location when permission is denied', async () => {
    await renderDrawMap();

    await waitFor(() => expect(requestPermission).toHaveBeenCalled());
    expect(screen.getByText('Me')).toBeDisabled();
    expect(getPosition).not.toHaveBeenCalled();
  });
});

describe('DrawMap country selection', () => {
  it('flies to the picked country', async () => {
    await renderDrawMap();

    await fireEvent.press(screen.getByText('Pick US'));

    expect(setCameraSpy).toHaveBeenCalledWith(
      expect.objectContaining({ centerCoordinate: [-98.5, 39.8], zoomLevel: 3 })
    );
  });
});

describe('DrawMap storage failures', () => {
  it('still saves new drawings after saved drawings fail to load', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    await renderDrawMap();
    await waitFor(() => expect(warnSpy).toHaveBeenCalledWith('Failed to load drawings', expect.any(Error)));

    await tapMap(3);
    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem('user_drawings')) ?? '[]');
      expect(saved.map((d: any) => d.geometry.type)).toEqual(['Polygon']);
    });
  });

  it('keeps the drawing on the map and warns when saving fails', async () => {
    await renderDrawMap();
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    await tapMap(3);
    await fireEvent.press(screen.getByTestId('finish-button'));

    await waitFor(() => expect(warnSpy).toHaveBeenCalledWith('Failed to save drawings', expect.any(Error)));
    expect(lastShape().features.some((f: any) => f.geometry.type === 'Polygon')).toBe(true);
  });
});

describe('DrawMap clear', () => {
  it('removes finished and in-progress shapes and deletes saved drawings', async () => {
    await renderDrawMap();
    await tapMap(3);
    await fireEvent.press(screen.getByTestId('finish-button'));
    await waitFor(async () => expect(await AsyncStorage.getItem('user_drawings')).not.toBeNull());
    await tapMap(1);
    expect(screen.getByText(/1 so far/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Clear'));

    expect(lastShape().features).toHaveLength(0);
    expect(screen.getByText('0.00 sq miles')).toBeOnTheScreen();
    expect(screen.getByText(/^Tap the map to start a polygon/)).toBeOnTheScreen();
    await waitFor(async () => expect(await AsyncStorage.getItem('user_drawings')).toBeNull());
  });
});

describe('DrawMap undo', () => {
  it('removes the most recent point, and is disabled with no points', async () => {
    await renderDrawMap();
    expect(screen.getByText('Undo')).toBeDisabled();

    await fireEvent.press(screen.getByText('Line'));
    await tapMap(3);
    await fireEvent.press(screen.getByText('Undo'));

    expect(screen.getByText(/2 so far/)).toBeOnTheScreen();
    expect(countPoints()).toBe(2);
  });
});

describe('DrawMap mode switching', () => {
  it('discards the line in progress when switching to Polygon', async () => {
    await renderDrawMap();
    await fireEvent.press(screen.getByText('Line'));
    await tapMap(2);
    expect(screen.getByTestId('finish-button')).toBeEnabled();

    await fireEvent.press(screen.getByText('Polygon'));

    expect(screen.getByText(/^Tap the map to start a polygon/)).toBeOnTheScreen();
    expect(screen.getByTestId('finish-button')).toBeDisabled();
    expect(countPoints()).toBe(0);
  });
});
