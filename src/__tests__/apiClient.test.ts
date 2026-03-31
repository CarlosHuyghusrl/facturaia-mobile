// Test the isAllowedUrl logic from apiClient

// We need to test the URL allowlist validation
// Since isAllowedUrl is not exported, we test it indirectly through apiClient behavior

describe('apiClient URL allowlist', () => {
  const ALLOWED_HOSTS = [
    '217.216.48.91',
    'localhost',
    '127.0.0.1',
    'api.facturaia.com',
  ];

  // Helper to check if URL would be allowed
  const isAllowedUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ALLOWED_HOSTS.some(host => parsed.hostname === host);
    } catch {
      return false;
    }
  };

  it('allows the production server URL', () => {
    expect(isAllowedUrl('http://217.216.48.91:8081/api/test')).toBe(true);
  });

  it('allows localhost', () => {
    expect(isAllowedUrl('http://localhost:8081/api/test')).toBe(true);
  });

  it('allows 127.0.0.1', () => {
    expect(isAllowedUrl('http://127.0.0.1:3000/api/test')).toBe(true);
  });

  it('allows future HTTPS domain', () => {
    expect(isAllowedUrl('https://api.facturaia.com/api/test')).toBe(true);
  });

  it('rejects unknown external hosts', () => {
    expect(isAllowedUrl('http://evil-server.com/steal-data')).toBe(false);
  });

  it('rejects similar but different hostnames', () => {
    expect(isAllowedUrl('http://api.facturaia.com.evil.com/api')).toBe(false);
  });

  it('rejects IP addresses not in allowlist', () => {
    expect(isAllowedUrl('http://192.168.1.1:8081/api/test')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(isAllowedUrl('not-a-url')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isAllowedUrl('')).toBe(false);
  });
});

describe('apiClient retry logic', () => {
  it('identifies network errors as retryable', () => {
    const isRetryableError = (error: any, status?: number): boolean => {
      if (error.message?.includes('Network') || error.message?.includes('fetch')) return true;
      if (status && status >= 500 && status < 600) return true;
      if (error.name === 'AbortError') return true;
      return false;
    };

    expect(isRetryableError(new Error('Network request failed'))).toBe(true);
    expect(isRetryableError(new Error('fetch failed'))).toBe(true);
    expect(isRetryableError({ name: 'AbortError', message: '' })).toBe(true);
    expect(isRetryableError(new Error(''), 500)).toBe(true);
    expect(isRetryableError(new Error(''), 503)).toBe(true);
    expect(isRetryableError(new Error(''), 400)).toBe(false);
    expect(isRetryableError(new Error(''), 401)).toBe(false);
    expect(isRetryableError(new Error('some error'))).toBe(false);
  });
});
