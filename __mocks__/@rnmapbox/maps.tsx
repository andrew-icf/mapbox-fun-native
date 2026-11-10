// Manual mock for @rnmapbox/maps — Jest applies this to every test
// automatically (root-adjacent __mocks__), no jest.mock() call needed.
// Replaces the native map with a pressable stand-in and exposes what's
// passed to ShapeSource via __shapeSourceSpy, so tests can drive map taps
// and inspect drawn GeoJSON without a real native map. Camera is a ref
// target whose setCamera is __setCameraSpy, so tests can see where the
// app moved the camera.
import React from 'react';
import { Pressable, View } from 'react-native';

const shapeSourceSpy = jest.fn();
const setCameraSpy = jest.fn();

function MapView({ onPress, children, style }: any) {
  const tapCount = React.useRef(0);
  return (
    <Pressable
      testID="map-view"
      style={style}
      onPress={() => {
        tapCount.current += 1;
        onPress?.({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-105 + tapCount.current * 0.01, 39 + tapCount.current * 0.01],
          },
          properties: {},
        });
      }}
    >
      {children}
    </Pressable>
  );
}

function ShapeSource({ shape, children }: any) {
  shapeSourceSpy(shape);
  return <View>{children}</View>;
}

const Camera = React.forwardRef(function Camera(_props: any, ref) {
  React.useImperativeHandle(ref, () => ({ setCamera: setCameraSpy }));
  return null;
});

const noop = () => null;

export default {
  MapView,
  Camera,
  LocationPuck: noop,
  ShapeSource,
  FillLayer: noop,
  LineLayer: noop,
  CircleLayer: noop,
  __shapeSourceSpy: shapeSourceSpy,
  __setCameraSpy: setCameraSpy,
};
