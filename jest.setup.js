jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

// Use the official in-memory AsyncStorage mock everywhere, so any test that
// touches persisted state (like DrawMap's saved drawings) behaves like the
// real module without a per-test jest.mock call.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);