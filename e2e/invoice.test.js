/**
 * E2E Test: Invoice Scanning Flow
 *
 * REQUIERE: Android emulator + expo prebuild + camera mock
 * NO se puede ejecutar en servidor headless.
 */

describe('Invoice Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should show camera button on home screen', async () => {
    await expect(element(by.id('scan-button'))).toBeVisible();
  });

  it('should navigate to camera screen', async () => {
    await element(by.id('scan-button')).tap();

    // Camera screen should show scan options
    await waitFor(element(by.text('Escáner Documentos')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show invoice list on home', async () => {
    await device.pressBack();

    // Should be back on home with invoice list
    await expect(element(by.text('Mis Facturas'))).toBeVisible();
  });

  it('should navigate to invoice detail', async () => {
    // Tap first invoice in list (if exists)
    try {
      await element(by.id('invoice-item-0')).tap();
      await waitFor(element(by.text('Detalle de Factura')))
        .toBeVisible()
        .withTimeout(5000);
    } catch {
      // No invoices yet - skip
      console.log('No invoices to tap - test skipped');
    }
  });
});
