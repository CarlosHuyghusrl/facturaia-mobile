/**
 * E2E Test: Login Flow
 *
 * REQUIERE: Android emulator + expo prebuild
 * NO se puede ejecutar en servidor headless.
 * Para CI: configurar GitHub Actions con Android emulator action.
 */

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should show login screen on launch', async () => {
    await expect(element(by.text('Iniciar Sesión'))).toBeVisible();
    await expect(element(by.id('rnc-input'))).toBeVisible();
    await expect(element(by.id('pin-input'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('rnc-input')).typeText('000000000');
    await element(by.id('pin-input')).typeText('0000');
    await element(by.id('login-button')).tap();

    // Should show error alert
    await expect(element(by.text('Error'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await device.reloadReactNative();
    await element(by.id('rnc-input')).typeText('130309094');
    await element(by.id('pin-input')).typeText('1234');
    await element(by.id('login-button')).tap();

    // Should navigate to Home screen
    await waitFor(element(by.text('Mis Facturas')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should show user info after login', async () => {
    await expect(element(by.text('Acela Associates'))).toBeVisible();
  });
});
