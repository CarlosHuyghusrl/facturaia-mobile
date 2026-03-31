import * as SecureStore from 'expo-secure-store';

// Helper: create a JWT token with given payload
function createTestJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'test_signature';
  return `${header}.${body}.${signature}`;
}

// Import after mocks are set up
const authService = require('../services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear SecureStore
    const store = require('expo-secure-store');
    store.__clear();
  });

  describe('isAuthenticated', () => {
    it('returns false when no token exists', async () => {
      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('returns true for valid non-expired token', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1h from now
      const token = createTestJwt({
        user_id: '123',
        exp: futureExp,
        iss: 'facturaia'
      });
      await SecureStore.setItemAsync('auth_token', token);

      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('returns false for expired token and cleans up', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1h ago
      const token = createTestJwt({
        user_id: '123',
        exp: pastExp,
        iss: 'facturaia'
      });
      await SecureStore.setItemAsync('auth_token', token);

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
      // Token should be cleaned up
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('returns false for malformed token (not 3 parts)', async () => {
      await SecureStore.setItemAsync('auth_token', 'not.a.valid.jwt.token');

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });

    it('returns false for completely invalid token', async () => {
      await SecureStore.setItemAsync('auth_token', 'garbage');

      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('stores token and cliente on successful login', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        cliente: { id: '1', nombre: 'Test', rnc: '123456789' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: { get: () => 'application/json' },
      });

      const result = await authService.login({ rnc: '123-456-789', pin: '1234' });

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'test-token');
    });

    it('returns error on failed login', async () => {
      const mockResponse = {
        success: false,
        error: 'RNC o PIN incorrectos',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: { get: () => 'application/json' },
      });

      const result = await authService.login({ rnc: '000000000', pin: '0000' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('logout', () => {
    it('clears token and cliente data', async () => {
      await SecureStore.setItemAsync('auth_token', 'test-token');
      await SecureStore.setItemAsync('cliente_data', '{}');

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cliente_data');
    });
  });
});
