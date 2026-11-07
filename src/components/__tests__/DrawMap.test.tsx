import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';
import DrawMap from '../DrawMap';
import { drawingColors } from '../../shared/colors';

// Replace CountryInfo with a stand-in, so this test checks drawing and color
// selection only, not the country GraphQL lookup (which needs an Apollo client).
jest.mock('../CountryInfo', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'Country info') };
});

// The real @rnmapbox/maps types don't declare this extra mock-only export.
const { __shapeSourceSpy: shapeSourceSpy } = Mapbox as unknown as { __shapeSourceSpy: jest.Mock };

const DEFAULT_COLOR = drawingColors[0].hex; // blue
const RED = drawingColors[1].hex;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

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
