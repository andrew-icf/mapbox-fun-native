# mapbox-fun-native

A React Native app that started as a port of [mapbox-fun](https://github.com/andrew-icf/mapbox-fun), my React web app for drawing and measuring shapes on a Mapbox map, and grew into a playground for mobile architecture, GraphQL, and testing.

The goal is to get hands-on with modern React Native and learn, in practice, what changes when an app moves from the browser to native iOS and Android.

## Features

- **Map tab:** draw polygons and lines with taps, see area and distance calculated with Turf, save drawings on the device, fly to your current location, and jump between countries
- **Load board tab:** a scrolling list of freight loads served by a local GraphQL schema, with debounced origin search built on RxJS
- **Bottom tab navigation** with typed routes
- **Every UI state handled:** loading, error, empty, and data

## Status

- [x] Expo project with a custom development build
- [x] Native Mapbox map with polygon and line drawing
- [x] Area and length calculations with Turf
- [x] Drawings persisted on device
- [x] User location
- [x] GraphQL with Apollo Client (public API and local schema)
- [x] Load board with RxJS search
- [x] Unit, component, and end-to-end tests
- [ ] Color palette for drawings
- [ ] Run on Android
- [ ] Upgrade to the latest Expo SDK

## Tech stack

- **React Native** and **TypeScript**, with **Expo SDK 54** and **expo-dev-client**
- **@rnmapbox/maps** (wraps Mapbox's native iOS and Android SDKs) and **Turf** for geospatial math
- **Apollo Client** with **GraphQL**, including a local schema built with `@graphql-tools/schema`
- **RxJS** for debounced search
- **React Navigation** (bottom tabs)
- **AsyncStorage** and **expo-location**
- **Jest**, **React Native Testing Library**, and **Maestro** for testing

## Architecture

```
src/
  app/            Navigation (bottom tabs)
  components/     Map screen and country info
  features/
    loads/        Load board: screen, card, search hook, formatters, queries
  graphql/        Local schema, resolvers, and mock data
  shared/         Theme tokens (colors, spacing)
  utils/          Pure drawing and measurement logic
  test/           Test data factories
  apollo.ts       Apollo Client and link routing
.maestro/         End-to-end flows
```

A few principles guide the structure:

- **Feature-based folders,** so each feature owns its screens, hooks, queries, and tests.
- **Logic separate from UI.** Drawing math and load formatting live in pure functions, which keeps components simple and makes the logic easy to test.
- **A data layer behind an interface.** `ApolloLink.split` sends the countries query to a public GraphQL API and everything else to a local schema running inside the app. Components don't know which is which, so pointing loads at a real server later means changing one file.
- **Business logic in the schema.** `ratePerMile` is a computed GraphQL field, so the UI never does that math.
- **Shared theme tokens** instead of hard-coded colors and spacing.

## Web vs. native: what changed in the port

| Web (mapbox-fun) | Native (this project) |
|---|---|
| Mapbox GL JS renders the map in the browser | @rnmapbox/maps drives Mapbox's native SDK |
| mapbox-gl-draw handles drawing | Web-only, so drawing is rebuilt with `onPress`, GeoJSON, `ShapeSource`, and layers |
| The draw library owns the shape state | React state is the source of truth, and the map renders from it |
| localStorage | AsyncStorage |
| Turf | Turf, unchanged (it's pure JavaScript) |

## Testing

The project follows the testing pyramid: many fast unit tests, fewer component tests, and a handful of end-to-end flows.

- **Unit tests (Jest):** drawing math, load formatters, the GraphQL schema and resolvers, and the debounced search hook (using fake timers)
- **Component tests (React Native Testing Library):** screens rendered with mocked GraphQL responses, including empty and error states, plus integration tests against the real local schema
- **End-to-end tests (Maestro):** drawing a polygon, drawing a line, and searching and scrolling the load board

```bash
npm test                                   # unit and component tests
npm run test:e2e                           # all Maestro flows
npm run test:e2e -- --include-tags smoke   # smoke suite only
```

Tests run with `TZ=America/Denver` so date formatting tests catch time-zone bugs on any machine, including CI servers that run in UTC.

## Notable decisions and lessons

- **Development build instead of Expo Go.** `@rnmapbox/maps` needs native code that Expo Go doesn't include, so the app is compiled with Xcode while JavaScript still loads live from Metro.
- **Expo SDK 54.** SDK 57 requires Xcode 26.4, which requires macOS Tahoe. SDK 54 supports Xcode 16.1+, so I chose it to unblock development without an OS upgrade.
- **Native vs. JavaScript changes.** Native changes need a rebuild and a store release, while JavaScript changes can ship over the air. A stale app install once caused a "native module is null" error for AsyncStorage, which is the same failure teams prevent in production by tying over-the-air updates to runtime versions.
- **Date-only values aren't moments in time.** Parsing `"2026-10-23"` with `new Date()` treats it as UTC midnight, which shows the previous day in US time zones, so pickup dates are parsed from their parts.
- **Data-independent end-to-end tests.** Maestro flows target test IDs and an end-of-list marker rather than hard-coded load names, with search terms kept in a single variable.

## Getting started

### Prerequisites

- macOS with Xcode 16.1+ and an iOS simulator runtime
- Node.js 20+ and CocoaPods
- A free [Mapbox](https://www.mapbox.com) account and public access token
- For end-to-end tests: Java 17+ and the [Maestro](https://maestro.mobile.dev) CLI

### Setup

```bash
git clone https://github.com/andrew-icf/mapbox-fun-native.git
cd mapbox-fun-native
npm install
```

Create a `.env` file in the project root (it's git-ignored):

```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your_public_token_here
```

### Run on iOS

```bash
npx expo prebuild --clean
npx expo run:ios
```

The first build takes several minutes. After that, TypeScript changes update instantly with fast refresh. Changes to `.env` need a Metro restart (`npx expo start --clear`), and changes to `app.json` or native dependencies need a rebuild.