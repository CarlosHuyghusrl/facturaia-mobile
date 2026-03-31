// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    getItemAsync: jest.fn((key) => Promise.resolve(store[key] || null)),
    setItemAsync: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    __store: store,
    __clear: () => Object.keys(store).forEach(k => delete store[k]),
  };
});

// Mock react-native (minimal - avoid loading native modules)
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'android', select: jest.fn((obj) => obj.android || obj.default) },
  NativeModules: {},
  StyleSheet: { create: jest.fn(styles => styles) },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Global fetch mock
global.fetch = jest.fn();

// atob polyfill for JWT decoding
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
