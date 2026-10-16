# mapbox-fun-native

A React Native port of [mapbox-fun](https://github.com/andrew-icf/mapbox-fun), my React + TypeScript web app for drawing and measuring shapes on a Mapbox map.

The goal of this project is to get hands-on with modern React Native and to learn, in practice, what changes when a mapping app moves from the browser to native iOS and Android.

## Status

Work in progress.

- [x] Expo project with a custom development build
- [x] Native Mapbox map rendering on iOS
- [x] Draw polygons and lines with tap gestures
- [x] Area and length calculations with Turf
- [x] Persist drawings on device
- [x] Add Graphql Service Layer
- [ ] Show the user's current location
- [ ] Run on Android
- [ ] Upgrade to the latest Expo SDK

## Tech stack

- **React Native** with **TypeScript**
- **Expo SDK 54** with **expo-dev-client**
- **@rnmapbox/maps** (wraps Mapbox's native iOS and Android SDKs)
- **expo-location** for device location (planned)
- **Turf** for geospatial calculations (planned, carried over from the web version)

## Web vs. native: what changes

Porting from the web version means rethinking anything that depended on the browser:

| Web (mapbox-fun) | Native