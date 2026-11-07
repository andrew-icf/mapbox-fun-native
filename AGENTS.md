# AGENTS.md

An Expo / React Native app with Mapbox drawing and a GraphQL load board. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. Before writing code that touches an Expo or React Native API:

1. Read the major version of `expo` in `package.json`. This project is pinned to SDK 54 on purpose (SDK 57 requires Xcode 26.4 and macOS Tahoe), so don't bump it casually.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt and follow its links. Never answer from memory.

## Commands

```bash
npm test                                    # unit + component tests (sets TZ=America/Denver)
npx jest src/utils/__tests__/drawing.test.ts   # single file (prefix TZ=America/Denver for date tests)
npx jest -t "filters loads by origin"       # single test by name
npm run test:e2e                            # all Maestro flows (needs simulator + installed build)
npm run test:e2e -- --include-tags smoke    # smoke suite only
npm run lint                                # expo lint
npm run typecheck                           # tsc --noEmit
npx expo install <package>                  # ALWAYS use instead of npm install for dependencies
npx expo-doctor                             # diagnose dependency and config issues
```

`npm test` pins the time zone so date tests behave the same everywhere, including UTC CI machines.

## Running the app

The app needs a development build, since `@rnmapbox/maps` has native code that Expo Go doesn't include. Builds run locally with Xcode; EAS is not configured.

```bash
npx expo prebuild --clean
npx expo run:ios
```

- `.env` must contain `EXPO_PUBLIC_MAPBOX_TOKEN=pk....` (git-ignored).
- `.env` changes need a Metro restart (`npx expo start --clear`).
- `app.json` or native dependency changes need a rebuild.

## Architecture

### Data layer: one Apollo client, two backends

`src/apollo.ts` uses `ApolloLink.split` to route by operation name: `GetCountry` goes to the public Countries API, and everything else goes to a `SchemaLink` running a local schema in-process (`src/graphql/localSchema.ts` and `mockLoads.ts`).

- Components never know which backend serves them. Pointing loads at a real server means editing `apollo.ts` only.
- A new query for the local schema needs no wiring, but **a new query for the public API must be added to the split rule**, or it silently hits the local schema and fails.
- Business logic belongs in the schema, not the UI. `ratePerMile` is a computed resolver field, and `MockLoad` is `Omit<Load, 'ratePerMile'>` so raw data can't carry it.

### Feature folders, with logic split out of the UI

```
src/
  app/AppTabs.tsx      Bottom tab navigator and TabParamList
  components/          DrawMap (map screen), CountryInfo
  features/loads/      Load board: screen, card, search hook, formatters, queries, types
  graphql/             Local schema, resolvers, mock data, public API queries
  shared/theme.ts      Color and spacing tokens
  utils/drawing.ts     Pure Turf geometry
  test/loadFactory.ts  Test data factory
```

- `utils/drawing.ts` and `features/loads/loadFormat.ts` hold pure, unit-tested logic.
- `features/loads/loadSearch.ts` exports `useLoadSearch`: an RxJS Subject with `debounceTime` and `distinctUntilChanged`. It returns `searchText` (updates per keystroke) and `searchQuery` (trimmed and debounced 300ms, used as the GraphQL variable).
- `DrawMap` keeps drawing state in React, since `mapbox-gl-draw` is web-only. A `useMemo` builds one FeatureCollection rendered through a single `ShapeSource`. Drawings persist to AsyncStorage under `user_drawings`, guarded by a `loaded` flag so the first read doesn't overwrite storage.

### Navigation

React Navigation bottom tabs (`createBottomTabNavigator`), **not Expo Router**. `src/app/` holds only the navigator file. Routes are typed with `TabParamList` in `src/app/AppTabs.tsx`. The provider order in `App.tsx` is `SafeAreaProvider` → `ApolloProvider` → `NavigationContainer` → `AppTabs`.

## Conventions

- Feature-based folders. Business logic lives in pure functions or hooks, not components.
- Use `colors` and `spacing` from `src/shared/theme.ts`. `DrawMap`'s overlays still use literal colors from before the theme existed.
- Components are PascalCase files; utilities and hooks are camelCase. Hooks start with `use`.
- Prefer Expo modules over third-party libraries.
- `ios/` and `android/` are generated and git-ignored. Never edit them by hand; configure native behavior in `app.json` plugins.
- GeoJSON coordinates are `[longitude, latitude]`.
- Never parse date-only strings with `new Date('YYYY-MM-DD')`, which treats them as UTC and shows the previous day in US time zones. Parse the parts instead, like `formatPickupDate`.

## Testing

Three layers:

1. **Unit (Jest):** drawing math, formatters, schema resolvers, and the debounced hook, which uses fake timers inside `await act(...)`.
2. **Component (React Native Testing Library):**
   - `MockedProvider` with explicit mocks for loading, empty, and error states. Mocked objects need `__typename`; use `withTypenames()` from `src/test/loadFactory.ts`.
   - A real Apollo client over the local schema for integration tests, with **a fresh client per test** so cached results can't leak.
   - Build fixtures with `makeLoad(overrides)`, overriding only the fields under test.
   - `AppTabs.test.tsx` mocks both screens, so it tests navigation without Mapbox or GraphQL.
3. **End-to-end (Maestro, `.maestro/*.yaml`):** data-independent flows targeting testIDs (`tab-map`, `tab-load-board`, `origin-search`, `load-list`, `load-card-<id>`, `finish-button`, `load-list-end`). **Preserve these testIDs when editing components.**

`jest.setup.js` mocks only `react-native-safe-area-context`.

### Testing rules

- Every change ships with tests.
- Test behavior, not implementation: query by visible text, role, or testID, and assert what the user sees or what a function returns.
- Every test must fail if the code it covers breaks. No tautological assertions, such as:
  - Asserting a value the test itself set (`const x = true; expect(x).toBe(true)`)
  - Asserting a mock returns what the test told it to return
- Don't unit test pure styling (colors, padding, fonts). If a style reflects state, like disabled or active, test the state instead.
- Don't rely on snapshot tests as the only assertion.
- React Native Testing Library v14: `render`, `renderHook`, and `fireEvent` are async, so always `await` them.
- A flaky test is a failing test. Never fix it with retries or longer timeouts. Isolate the root cause and fix it:
  - Timing: use fake timers, `waitFor`, or `findBy` queries instead of fixed delays.
  - Async: `await` every async call and render, and wrap state updates in `act`.
  - Shared state: reset mocks and use a fresh Apollo client per test.
  - Brittle locators: target testIDs or roles, not changing text or element positions.
- If a flaky test can't be fixed right away, flag it. Don't silently skip or delete it.

## Working agreement

- Plan before writing code for anything bigger than a one-line change, and wait for approval.
- Work in small steps. After each step, explain what changed and why, then stop for review.
- Run lint, typecheck, and tests before saying work is done.
- Never commit `.env` or secrets.