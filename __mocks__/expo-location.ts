// Manual mock for expo-location — Jest applies this to every test
// automatically (root-adjacent __mocks__), no jest.mock() call needed.
export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({ status: 'denied' });
export const getCurrentPositionAsync = jest.fn().mockResolvedValue({ coords: { latitude: 0, longitude: 0 } });
